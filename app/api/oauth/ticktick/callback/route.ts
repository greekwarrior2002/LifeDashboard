import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  OAUTH_STATE_COOKIE_PREFIX,
  verifyStateToken,
} from "@/lib/integrations/oauth-state";
import {
  exchangeTickTickCode,
  persistTickTickTokens,
} from "@/lib/integrations/ticktick";

export const runtime = "nodejs";

function popupResponse(status: "ok" | "error", message?: string) {
  const body = `<!doctype html><html><body><script>
    (function() {
      try {
        if (window.opener) {
          window.opener.postMessage({ source: "lifeos-oauth", provider: "ticktick", status: ${JSON.stringify(status)}, message: ${JSON.stringify(message ?? "")} }, window.location.origin);
        }
      } catch (e) {}
      window.close();
      document.body.innerText = ${JSON.stringify(status === "ok" ? "Connected — you can close this window." : "Connection failed: " + (message ?? "unknown") + ". You can close this window.")};
    })();
  </script></body></html>`;
  return new NextResponse(body, {
    status: status === "ok" ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return popupResponse("error", "unauthorized");

  const url = req.nextUrl;
  const error = url.searchParams.get("error");
  if (error) return popupResponse("error", error);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(`${OAUTH_STATE_COOKIE_PREFIX}ticktick`)?.value;
  if (!code || !state || state !== cookieState) {
    return popupResponse("error", "state_mismatch");
  }
  if (!verifyStateToken(auth.secret, state)) {
    return popupResponse("error", "invalid_state");
  }

  try {
    const tokens = await exchangeTickTickCode(code);
    await persistTickTickTokens(auth.secret, tokens);
  } catch (err) {
    return popupResponse("error", (err as Error).message);
  }

  const res = popupResponse("ok");
  res.cookies.set(`${OAUTH_STATE_COOKIE_PREFIX}ticktick`, "", {
    path: "/",
    maxAge: 0,
  });
  return res;
}
