"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Loader2, Plug } from "lucide-react";
import type { IntegrationProvider } from "@/lib/types/user";
import { cn } from "@/lib/utils";

type Props = {
  provider: IntegrationProvider;
  label: string;
  connected: boolean;
  onChange: () => Promise<void>;
};

export function OAuthButton({ provider, label, connected, onChange }: Props) {
  const [pending, setPending] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | {
            source?: string;
            provider?: string;
            status?: "ok" | "error";
            message?: string;
          }
        | undefined;
      if (
        data?.source !== "lifeos-oauth" ||
        data.provider !== provider
      ) {
        return;
      }
      setPending(false);
      void onChange();
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [provider, onChange]);

  const start = () => {
    setPopupBlocked(false);
    setPending(true);
    const w = 520;
    const h = 640;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      `/api/oauth/${provider}/start`,
      `lifeos-oauth-${provider}`,
      `width=${w},height=${h},left=${left},top=${top}`,
    );
    if (!popup) {
      setPending(false);
      setPopupBlocked(true);
      return;
    }
    popupRef.current = popup;
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        setPending(false);
        void onChange();
      }
    }, 500);
  };

  const disconnect = async () => {
    setPending(true);
    try {
      await fetch(`/api/oauth/${provider}/disconnect`, { method: "POST" });
      await onChange();
    } finally {
      setPending(false);
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2 py-1 text-[11px] text-neon-emerald">
          <Check className="h-3 w-3" /> Connected
        </span>
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

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md border border-neon-blue/30 bg-neon-blue/10 px-2.5 text-[11px] text-white transition-colors hover:bg-neon-blue/20",
          pending && "opacity-60",
        )}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plug className="h-3 w-3" />
        )}
        Connect {label}
      </button>
      {popupBlocked ? (
        <span className="flex items-center gap-1 text-[10px] text-neon-amber">
          <Link2 className="h-3 w-3" /> Popup blocked — allow popups and retry.
        </span>
      ) : null}
    </div>
  );
}
