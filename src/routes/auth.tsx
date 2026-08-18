import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/lib/theme";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Admin · Sign in" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AuthPage,
});

const ADMIN_EMAIL = "mayantha743@gmail.com";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // Check if already logged in
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !mounted) return;
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin && mounted) navigate({ to: "/admin" });
    }
    void checkSession();
    return () => { mounted = false; };
  }, [navigate]);

  // Focus password input on mount
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function attemptLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setLoading(true);

    try {
      // Authenticate via Supabase — this is the sole verification
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error("Invalid credentials");
      }

      if (!signInData.user) {
        throw new Error("Authentication failed");
      }

      // Verify admin status via server-side RPC
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

      if (adminError) {
        // Fail closed — sign out and reject
        await supabase.auth.signOut();
        throw new Error("Authorization check failed. Please try again.");
      }

      if (!isAdmin) {
        // Not an admin — sign out and reject
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access");
      }

      // Fully verified admin session
      setSuccess(true);
      setTimeout(() => navigate({ to: "/admin" }), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      triggerShake();
      setPassword("");
      setTimeout(() => passwordRef.current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md card-soft rounded-2xl p-8">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to site
        </Link>

        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Mayantha Portfolio
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Admin access</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to manage site content.
        </p>

        <form onSubmit={attemptLogin} className={`mt-8 space-y-4 ${shake ? "auth-shake" : ""}`}>
          <div>
            <label htmlFor="auth-email" className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              disabled={loading || success}
              autoComplete="email"
              className="mt-1 w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="auth-password"
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              disabled={loading || success}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || !password.trim()}
            className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Status messages */}
        <div className="mt-4 text-center min-h-[1.5rem]">
          {error && !loading && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Access granted — redirecting…
            </p>
          )}
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground/60 text-center">
          Contact the site owner if you've lost access.
        </p>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes auth-shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-6px); }
          30%, 60%, 90% { transform: translateX(6px); }
        }
        .auth-shake {
          animation: auth-shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
