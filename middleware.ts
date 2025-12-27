import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const role = req.auth?.user?.role;

    // Protect Dashboard
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (nextUrl.pathname.startsWith("/teacher") && role !== "TEACHER") {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Redirect logged in users away from login
    if (nextUrl.pathname.startsWith("/login") && isLoggedIn) {
        if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
        if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher", nextUrl));
        return NextResponse.redirect(new URL("/student", nextUrl)); // Default student
    }

    // Redirect root to role-based dashboard if logged in
    if (nextUrl.pathname === "/" && isLoggedIn) {
        if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
        if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher", nextUrl));
        return NextResponse.redirect(new URL("/student", nextUrl));
    }

    if (!isLoggedIn && !nextUrl.pathname.startsWith("/login") && !nextUrl.pathname.startsWith("/api")) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
