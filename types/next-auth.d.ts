import { Role } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
            grade: number;
            class: number;
            number: number;
        } & DefaultSession["user"];
    }

    interface User {
        role: Role;
        grade?: number | null;
        class?: number | null;
        number?: number | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        id: string;
        grade: number;
        class: number;
        number: number;
    }
}
