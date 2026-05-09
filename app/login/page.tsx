import { Command, Lock, AlertTriangle } from "lucide-react";

type Search = { error?: string; next?: string; config?: string };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const error = searchParams?.error === "1";
  const misconfigured = searchParams?.config === "1";
  const next = searchParams?.next ?? "/";

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint bg-[size:48px_48px] opacity-[0.35]" />

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 shadow-glow">
            <Command className="h-5 w-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white">Life OS</h1>
            <p className="mt-1 text-[12px] text-muted">Private command center · sign in to continue</p>
          </div>
        </div>

        <form
          method="POST"
          action="/api/auth/login"
          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 shadow-glass backdrop-blur-xl"
        >
          <input type="hidden" name="next" value={next} />

          <label className="block text-[11px] uppercase tracking-widest text-muted">
            Passphrase
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3">
            <Lock className="h-4 w-4 text-muted" />
            <input
              autoFocus
              required
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              className="h-11 flex-1 bg-transparent text-[14px] text-white placeholder:text-muted focus:outline-none"
            />
          </div>

          {error ? (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-neon-rose">
              <AlertTriangle className="h-3.5 w-3.5" />
              Incorrect passphrase.
            </p>
          ) : null}

          {misconfigured ? (
            <p className="mt-3 flex items-start gap-1.5 rounded-md border border-neon-amber/30 bg-neon-amber/10 px-2.5 py-2 text-[11px] text-neon-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Server is missing <code className="font-mono">LIFEOS_PASSWORD</code> and/or{" "}
              <code className="font-mono">LIFEOS_AUTH_SECRET</code>. Set them in your hosting
              provider, redeploy, then try again.
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-xl border border-neon-blue/30 bg-gradient-to-r from-neon-blue/20 to-neon-violet/20 text-[13px] font-medium text-white shadow-glow transition-transform hover:scale-[1.01]"
          >
            Enter
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted">
          Single-user · HMAC-signed cookie · 30-day session
        </p>
      </div>
    </div>
  );
}
