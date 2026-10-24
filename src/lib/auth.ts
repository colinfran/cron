import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  alertChannels,
  verificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  events: {
    createUser: async ({ user }) => {
      if (user.id && user.email) {
        await db.insert(alertChannels).values({
          userId: user.id,
          type: "email",
          config: { email: user.email },
        });
      }
    },
  },
});
