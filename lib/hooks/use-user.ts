"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicUserState } from "@/lib/types/user";

type State = {
  user: PublicUserState | null;
  loading: boolean;
  error: string | null;
};

export function useUser() {
  const [state, setState] = useState<State>({
    user: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const user = (await res.json()) as PublicUserState;
      setState({ user, loading: false, error: null });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
