import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: Role;
      teamId?: string | null;
      teamName?: string | null;
      initials?: string;
    };
  }

  interface User {
    role?: Role;
    teamId?: string | null;
    teamName?: string | null;
    initials?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    teamId?: string | null;
    teamName?: string | null;
    initials?: string;
    active?: boolean;
    refreshedAt?: number;
  }
}
