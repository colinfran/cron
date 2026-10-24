import { afterEach, describe, expect, it, vi } from "vitest";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GitHub OAuth callback", () => {
  it.each([
    { issuer: "https://github.com/login/oauth", validState: true, accepted: true },
    { issuer: "https://unexpected.example.com", validState: true, accepted: false },
    { issuer: "https://github.com/login/oauth", validState: false, accepted: false },
  ])("validates callback issuer $issuer and state=$validState", async ({ issuer, validState, accepted }) => {
    const provider = authConfig.providers[0];
    if (typeof provider === "function" || provider.type !== "oauth") {
      throw new Error("Expected the configured GitHub OAuth provider");
    }
    expect(provider.options?.issuer).toBe("https://github.com/login/oauth");
    expect(provider.options?.checks).toEqual(["pkce", "state"]);

    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url === "https://github.com/login/oauth/access_token") {
        return Response.json({ access_token: "mock-github-token", token_type: "bearer" });
      }
      if (url === "https://api.github.com/user") {
        return Response.json({
          id: 123, login: "colinfran", name: "Colin", email: "owner@example.com", avatar_url: null,
        });
      }
      throw new Error(`Unexpected OAuth request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { handlers } = NextAuth({
      ...authConfig,
      trustHost: true,
      logger: { error: vi.fn() },
      secret: "test-oauth-callback-secret-not-for-production",
      providers: [GitHub({ ...provider.options, clientId: "test-client", clientSecret: "test-client-secret" })],
    });
    const cookies = new Map<string, string>();
    function storeCookies(response: Response) {
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const separator = pair.indexOf("=");
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
    }
    const cookieHeader = () => Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ");
    const origin = "http://localhost:3000";
    const csrfResponse = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`));
    storeCookies(csrfResponse);
    const { csrfToken } = await csrfResponse.json();
    const start = await handlers.POST(new NextRequest(`${origin}/api/auth/signin/github`, {
      method: "POST",
      headers: { Cookie: cookieHeader(), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken, callbackUrl: `${origin}/dashboard` }),
    }));
    storeCookies(start);
    const authorizationUrl = new URL(start.headers.get("location")!);
    expect(authorizationUrl.origin).toBe("https://github.com");
    expect(authorizationUrl.searchParams.get("code_challenge")).toBeTruthy();
    const state = authorizationUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const callback = new URL(`${origin}/api/auth/callback/github`);
    callback.search = new URLSearchParams({
      code: "mock-authorization-code", state: validState ? state! : "invalid-state", iss: issuer,
    }).toString();
    const response = await handlers.GET(new NextRequest(callback, { headers: { Cookie: cookieHeader() } }));
    const tokenRequest = fetchMock.mock.calls.find(([input]) => String(input) === "https://github.com/login/oauth/access_token");
    if (accepted) {
      expect(response.headers.get("location")).toBe(`${origin}/dashboard`);
      expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("authjs.session-token="))).toBe(true);
      expect(tokenRequest).toBeDefined();
      expect(String(tokenRequest![1]?.body)).toContain("code_verifier=");
    } else {
      expect(response.headers.get("location")).toContain("error=");
      expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith("authjs.session-token="))).toBe(false);
      expect(tokenRequest).toBeUndefined();
    }
  });
});
