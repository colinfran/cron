import { describe, it, expect } from "vitest";
import { authConfig } from "@/lib/auth.config";
import { POST } from "@/app/api/auth/signup/route";

const owner = { id: "owner", email: "owner@example.com" };
const account = { provider: "github", type: "oauth" as const, providerAccountId: "123" };

describe("Private GitHub access", () => {
  it("only exposes the GitHub provider", () => {
    expect(authConfig.providers).toHaveLength(1);
    expect(authConfig.pages).toMatchObject({ signIn: "/", error: "/" });
  });

  it("allows the owner, case-insensitively", async () => {
    const signIn = authConfig.callbacks!.signIn!;
    expect(await signIn({ user: owner, account, profile: { login: "colinfran" } })).toBe(true);
    expect(await signIn({ user: owner, account, profile: { login: "ColinFran" } })).toBe(true);
  });

  it("denies other accounts, missing profiles, and non-GitHub providers", async () => {
    const signIn = authConfig.callbacks!.signIn!;
    expect(await signIn({ user: owner, account, profile: { login: "another-user" } })).toBe(false);
    expect(await signIn({ user: owner, account })).toBe(false);
    expect(await signIn({ user: owner, account: null, profile: { login: "colinfran" } })).toBe(false);
    expect(await signIn({
      user: owner, account: { ...account, provider: "credentials" }, profile: { login: "colinfran" },
    })).toBe(false);
  });

  it("marks new owner sessions and retains their user ID", async () => {
    const jwt = authConfig.callbacks!.jwt!;
    const token = await jwt({
      token: {}, user: owner, account, profile: { login: "colinfran" }, trigger: "signIn",
    });
    expect(token).toMatchObject({ id: "owner", githubLogin: "colinfran" });
    expect(await jwt({ token: token!, user: owner, account: null })).toEqual(token);
  });

  it("rejects legacy sessions and unauthorized JWT issuance", async () => {
    const jwt = authConfig.callbacks!.jwt!;
    expect(await jwt({ token: { id: "legacy" }, user: owner, account: null })).toBeNull();
    expect(await jwt({
      token: {}, user: owner, account, profile: { login: "another-user" }, trigger: "signIn",
    })).toBeNull();
    expect(await jwt({
      token: {}, user: owner, account: { ...account, provider: "credentials" },
      profile: { login: "colinfran" }, trigger: "signIn",
    })).toBeNull();
  });

  it("explicitly rejects registration without creating an account", async () => {
    const response = await POST();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Registration is disabled. This workspace uses GitHub-only owner access.",
    });
  });
});
