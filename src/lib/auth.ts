import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { initialsFromName } from "./types";

const JWT_PROFILE_REFRESH_MS = 5 * 60 * 1000;
const useSecureCookies = process.env.NODE_ENV === "production";
const sessionTokenName = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { team: true },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          teamName: user.team?.name ?? null,
          initials: initialsFromName(user.name),
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  cookies: {
    sessionToken: {
      name: sessionTokenName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.teamId = user.teamId;
        token.teamName = user.teamName;
        token.initials = user.initials;
        token.sessionVersion = user.sessionVersion ?? 0;
        token.refreshedAt = Date.now();
        return token;
      }

      const userId = (token.id as string | undefined) || (token.sub as string | undefined);
      if (!userId) return null;

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { team: true },
      });

      // null → Auth.js limpa o cookie (sessão revogada / usuário inativo)
      if (
        !dbUser ||
        !dbUser.active ||
        dbUser.sessionVersion !== ((token.sessionVersion as number | undefined) ?? 0)
      ) {
        return null;
      }

      const refreshedAt = (token.refreshedAt as number | undefined) ?? 0;
      if (Date.now() - refreshedAt > JWT_PROFILE_REFRESH_MS) {
        token.role = dbUser.role;
        token.teamId = dbUser.teamId;
        token.teamName = dbUser.team?.name ?? null;
        token.initials = initialsFromName(dbUser.name);
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.sessionVersion = dbUser.sessionVersion;
        token.refreshedAt = Date.now();
      }

      return token;
    },
    session({ session, token }) {
      if (!token?.id) {
        session.user = undefined as unknown as typeof session.user;
        return session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role | undefined;
        session.user.teamId = token.teamId as string | null | undefined;
        session.user.teamName = token.teamName as string | null | undefined;
        session.user.initials = token.initials as string | undefined;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
});
