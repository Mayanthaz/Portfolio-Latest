import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/lib/theme";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Admin · Sign in" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "forgot" | "reset";

const ADMIN_EMAIL_SHA256 = "5707013f5c5b7818f7f608748214ebd19f9621750736c0cacce6b8ed9da2e345";
const PRODUCTION_RECOVERY_URL = "https://mayantha.dev/auth?recovery=1";

function getRecoveryRedirectUrl() {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.origin}/auth?recovery=1`;
  }
  return PRODUCTION_RECOVERY_URL;
}

async function isApprovedRecoveryEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalizedEmail);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return hash === ADMIN_EMAIL_SHA256;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const recoveryRequested = searchParams.get("recovery") === "1";
    const tokenHash = searchParams.get("token_hash");
    const recoveryType = searchParams.get("type");

    if (recoveryRequested) setMode("reset");

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        setMode("reset");
        setRecoveryReady(true);
        setError(null);
        setInfo("Enter a new password for the admin account.");
      }
    });

    async function initializeAuth() {
      if (tokenHash && recoveryType === "recovery") {
        const { error: verificationError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (!mounted) return;
        if (verificationError) {
          setRecoveryReady(false);
          setError("This password reset link is invalid or expired. Request a new link.");
          return;
        }

        window.history.replaceState({}, "", "/auth?recovery=1");
        setRecoveryReady(true);
        setError(null);
        setInfo("Enter a new password for the admin account.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      if (recoveryRequested) {
        if (session) {
          setRecoveryReady(true);
          setInfo("Enter a new password for the admin account.");
        } else {
          setRecoveryReady(false);
          setError(
            "This page has no recovery session. Request a new reset link and open it directly.",
          );
        }
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!mounted || !data.user) return;
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        if (mounted) setError("Unable to sign in with those credentials.");
        return;
      }
      navigate({ to: "/admin" });
    }

    void initializeAuth();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        if (await isApprovedRecoveryEmail(email)) {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim().toLowerCase(),
            {
              redirectTo: getRecoveryRedirectUrl(),
            },
          );
          if (resetError) {
            throw new Error("Unable to send a reset link right now. Please wait and retry.");
          }
        }
        setInfo("If the account is valid, password reset instructions have been sent.");
        return;
      }

      if (mode === "reset") {
        if (!recoveryReady) {
          throw new Error("Request a new password reset link before choosing a password.");
        }
        if (password !== confirmPassword) {
          throw new Error("The passwords do not match.");
        }

        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        await supabase.auth.signOut();
        changeMode("signin");
        setInfo("Password updated. Sign in with your new password.");
        window.history.replaceState({}, "", "/auth");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw new Error("Unable to sign in with those credentials.");
      const { data: isAdmin, error: authorizationError } = await supabase.rpc("is_admin");
      if (authorizationError || !isAdmin || !data.user) {
        await supabase.auth.signOut();
        throw new Error("Unable to sign in with those credentials.");
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "signin"
      ? "Admin sign in"
      : mode === "forgot"
        ? "Reset password"
        : "Choose a new password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md card-soft rounded-2xl p-8">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Mayantha Portfolio
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin" && "Sign in with the single approved admin account."}
          {mode === "forgot" && "A recovery link will be sent to the admin email."}
          {mode === "reset" && "Use at least 6 characters for the new password."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode !== "reset" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {mode !== "forgot" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "reset" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {mode === "reset" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirm new password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl bg-muted border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
          {info && <p className="text-xs text-emerald-600 dark:text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={loading || (mode === "reset" && !recoveryReady)}
            className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading
              ? "Working…"
              : mode === "signin"
                ? "Sign in"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Update password"}
          </button>
        </form>

        {mode === "signin" && (
          <button
            type="button"
            onClick={() => changeMode("forgot")}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Forgot password?
          </button>
        )}

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => changeMode("signin")}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            ← Back to sign in
          </button>
        )}

        {mode === "reset" && !recoveryReady && (
          <button
            type="button"
            onClick={() => changeMode("forgot")}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Request a new reset link
          </button>
        )}
      </div>
    </div>
  );
}
