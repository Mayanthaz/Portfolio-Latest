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

const PASSCODE_LENGTH = 7;
const ADMIN_EMAIL = "mayantha743@gmail.com";

function AuthPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(PASSCODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function attemptLogin(passcode: string) {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: passcode,
      });

      if (signInError || !data.user) {
        throw new Error(signInError?.message || "Sign-in failed: no user returned");
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error(adminError?.message || "Admin check failed: is_admin returned false");
      }

      setSuccess(true);
      setTimeout(() => navigate({ to: "/admin" }), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      triggerShake();
      setDigits(Array(PASSCODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    if (digit && index < PASSCODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && index === PASSCODE_LENGTH - 1) {
      const passcode = newDigits.join("");
      if (passcode.length === PASSCODE_LENGTH) {
        void attemptLogin(passcode);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PASSCODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const passcode = digits.join("");
      if (passcode.length === PASSCODE_LENGTH) {
        void attemptLogin(passcode);
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PASSCODE_LENGTH);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, PASSCODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === PASSCODE_LENGTH) {
      void attemptLogin(pasted);
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
          Enter your passcode to continue.
        </p>

        {/* Passcode input boxes */}
        <div
          className={`mt-8 flex justify-center gap-2 sm:gap-3 ${shake ? "auth-shake" : ""}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={loading || success}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1}`}
              className={`
                w-10 h-12 sm:w-12 sm:h-14
                rounded-xl border text-center text-lg font-semibold
                transition-all duration-200 outline-none
                bg-muted
                ${success
                  ? "border-emerald-500 text-emerald-500 dark:border-emerald-400 dark:text-emerald-400"
                  : error
                    ? "border-destructive text-destructive"
                    : digit
                      ? "border-primary text-foreground shadow-sm shadow-primary/20"
                      : "border-border text-foreground"
                }
                focus:ring-2 focus:ring-ring focus:border-primary
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
              style={{ caretColor: "transparent" }}
            />
          ))}
        </div>

        {/* Status messages */}
        <div className="mt-5 text-center min-h-[1.5rem]">
          {loading && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              Verifying…
            </p>
          )}
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
