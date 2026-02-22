import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;
  const role = sessionClaims?.publicMetadata?.role;
  const isAuthorityUser = role === "authority";

  const isAuthorityAuthPage =
    pathname.startsWith("/authority/sign-in") ||
    pathname.startsWith("/authority/sign-up");
  const isAuthorityProtectedRoute =
    pathname.startsWith("/authority") && !isAuthorityAuthPage;
  const isCitizenAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (userId && isAuthorityAuthPage) {
    if (isAuthorityUser) {
      return NextResponse.redirect(new URL("/authority/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (userId && isCitizenAuthPage && isAuthorityUser) {
    return NextResponse.redirect(new URL("/authority/dashboard", req.url));
  }

  if (isAuthorityProtectedRoute && !userId) {
    const signInUrl = new URL("/authority/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthorityProtectedRoute && userId) {
    if (role !== "authority") {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
