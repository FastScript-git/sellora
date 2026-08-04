import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(
  async (_auth, request) => {
    const pathname = request.nextUrl.pathname;

    const isClerkAuthRoute =
      pathname === "/sign-in" ||
      pathname.startsWith("/sign-in/") ||
      pathname === "/sign-up" ||
      pathname.startsWith("/sign-up/");

    if (isClerkAuthRoute) {
      return NextResponse.next();
    }

    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/__clerk")
    ) {
      return NextResponse.next();
    }

    return intlMiddleware(request);
  },
);

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};