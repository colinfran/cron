import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export const OWNER_GITHUB_LOGIN = "colinfran";

export const authConfig: NextAuthConfig = {
  providers: [
    // Match GitHub's RFC 9207 callback issuer (also fixed in upstream Auth.js).
    GitHub({ issuer: "https://github.com/login/oauth", checks: ["pkce", "state"] }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "github" &&
        typeof profile?.login === "string" &&
        profile.login.toLowerCase() === OWNER_GITHUB_LOGIN;
    },
    jwt({ token, user, account, profile }) {
      if (account) {
        if (account.provider !== "github" ||
          typeof profile?.login !== "string" ||
          profile.login.toLowerCase() !== OWNER_GITHUB_LOGIN) {
          return null;
        }
        token.githubLogin = OWNER_GITHUB_LOGIN;
      }
      // Reject sessions issued before GitHub-only owner access was enabled.
      if (token.githubLogin !== OWNER_GITHUB_LOGIN) return null;
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
