"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Plug,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  connected: boolean;
  connectedAt: string | null;
  onChange: () => Promise<void>;
  onIssued?: (response: ConnectResponse) => void;
  onDisconnected?: () => void;
};

export type ConnectResponse = {
  apiKey: string;
  webhookUrl: string;
  fallbackUrl?: string;
  warnings?: string[];
};

export function AppleHealthConnect({
  connected,
  connectedAt,
  onChange,
  onIssued,
  onDisconnected,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const issue = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/apple-health/connect", {
        method: "POST",
      });
      if (!res.ok) {
        setError(`Couldn't issue key (HTTP ${res.status})`);
        return;
      }
      const data = (await res.json()) as ConnectResponse;
      onIssued?.(data);
      await onChange();
    } catch (err) {
      setError(`Network error — ${(err as Error).message}`);
    } finally {
      setPending(false);
    }
  };

  const disconnect = async () => {
    setPending(true);
    setError(null);
    try {
      await fetch("/api/integrations/apple-health/disconnect", {
        method: "POST",
      });
      onDisconnected?.();
      await onChange();
    } finally {
      setPending(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={issue}
          disabled={pending}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2.5 text-[11px] text-white transition-colors hover:bg-neon-emerald/20",
            pending && "opacity-60",
          )}
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plug className="h-3 w-3" />
          )}
          Connect Apple Health
        </button>
        {error ? (
          <span className="text-[10px] text-neon-rose">{error}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2 py-1 text-[11px] text-neon-emerald">
        <Check className="h-3 w-3" /> Connected
        {connectedAt
          ? ` · ${new Date(connectedAt).toLocaleDateString()}`
          : ""}
      </span>
      <button
        type="button"
        onClick={issue}
        disabled={pending}
        className="flex items-center gap-1 text-[11px] text-muted hover:text-white disabled:opacity-50"
        title="Generate a new key (invalidates the old one)"
      >
        <RefreshCw className="h-3 w-3" /> Rotate
      </button>
      <button
        type="button"
        onClick={disconnect}
        disabled={pending}
        className="text-[11px] text-muted underline-offset-2 hover:text-white hover:underline disabled:opacity-50"
      >
        Disconnect
      </button>
    </div>
  );
}

export function AppleHealthSetupPanel({
  apiKey,
  webhookUrl,
  fallbackUrl,
  warnings,
  onClose,
}: {
  apiKey: string;
  webhookUrl: string;
  fallbackUrl?: string;
  warnings?: string[];
  onClose?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState<"key" | "url" | null>(null);

  const copy = async (kind: "key" | "url", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1500);
    } catch {}
  };

  return (
    <div className="space-y-3 rounded-xl border border-neon-emerald/20 bg-neon-emerald/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-white">
            Save this key now — it's shown once.
          </p>
          <p className="text-[11px] text-muted">
            Open Health Auto Export on iOS → Automations → REST API → Add
            destination. Paste the webhook into the URL field, then add an
            Authorization header.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-muted hover:text-white"
          >
            Done
          </button>
        ) : null}
      </div>

      {webhookUrl.includes("localhost") || webhookUrl.startsWith("http://") ? (
        <div className="flex items-start gap-2 rounded-lg border border-neon-amber/25 bg-neon-amber/[0.08] p-3 text-[11px] leading-relaxed text-neon-amber">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This URL is not a public HTTPS address. Health Auto Export on your
            iPhone will reject localhost or plain HTTP URLs. Set{" "}
            <code className="font-mono">LIFEOS_PUBLIC_URL</code> to your
            deployed HTTPS URL, then reconnect Apple Health.
          </span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Field label="Webhook URL" value={webhookUrl}>
          <button
            type="button"
            onClick={() => copy("url", webhookUrl)}
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
          >
            {copied === "url" ? (
              <Check className="h-3 w-3 text-neon-emerald" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "url" ? "Copied" : "Copy"}
          </button>
        </Field>

        <Field
          label="Header name"
          value="Authorization"
        >
          <button
            type="button"
            onClick={() => copy("key", "Authorization")}
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
          >
            {copied === "key" ? (
              <Check className="h-3 w-3 text-neon-emerald" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "key" ? "Copied" : "Copy"}
          </button>
        </Field>

        <Field
          label="Header value"
          value={show ? `Bearer ${apiKey}` : `Bearer ${"•".repeat(40)}`}
        >
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
          >
            {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {show ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            onClick={() => copy("url", `Bearer ${apiKey}`)}
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
          >
            {copied === "url" ? (
              <Check className="h-3 w-3 text-neon-emerald" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied === "url" ? "Copied" : "Copy"}
          </button>
        </Field>

        {fallbackUrl ? (
          <Field label="Fallback URL (only if headers are unavailable)" value={fallbackUrl}>
            <button
              type="button"
              onClick={() => copy("url", fallbackUrl)}
              className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] px-2 text-[11px] text-subtle hover:text-white"
            >
              {copied === "url" ? (
                <Check className="h-3 w-3 text-neon-emerald" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied === "url" ? "Copied" : "Copy"}
            </button>
          </Field>
        ) : null}
      </div>

      {warnings?.length ? (
        <div className="rounded-lg border border-neon-amber/25 bg-neon-amber/[0.08] p-3 text-[11px] leading-relaxed text-neon-amber">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <ol className="space-y-1 text-[11px] text-muted">
        <li>
          1. In Health Auto Export, set Method to <span className="text-white">POST</span> and Content Type to <span className="text-white">JSON</span>.
        </li>
        <li>
          2. Pick the metrics to export (Sleep, HRV,
          Steps, Active Energy, Workouts is a good baseline).
        </li>
        <li>
          3. Set Aggregation to <span className="text-white">Daily</span> and a
          schedule (hourly or every few hours works well).
        </li>
        <li>
          4. Tap <span className="text-white">Export Now</span> once to push the
          last 7–30 days. Cards on this dashboard light up within seconds.
        </li>
      </ol>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate font-mono text-[11px] text-white">
          {value}
        </code>
        {children}
      </div>
    </div>
  );
}
