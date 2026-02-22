import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Pages that are open to everyone (sign-in, sign-up, upgrade, complete-setup)
  const isAuthorityAuthPage =
    pathname.startsWith("/authority/sign-in") ||
    pathname.startsWith("/authority/sign-up") ||
    pathname.startsWith("/authority/upgrade") ||
    pathname.startsWith("/authority/complete-setup");

  const isAuthorityProtectedRoute =
    pathname.startsWith("/authority") && !isAuthorityAuthPage;

  const isCitizenAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  const isCitizenSetupPage = pathname.startsWith("/citizen-setup");

  const isProtectedCitizenRoute =
    pathname.startsWith("/create-post") || pathname.startsWith("/profile");

  // Fetch live role from Clerk — bypasses JWT claims entirely.
  const getRole = async () => {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      return user.publicMetadata?.role ?? null;
    } catch {
      return null;
    }
  };

  // ── Signed-in AUTHORITY users hitting authority auth pages → skip to dashboard ──
  if (userId && isAuthorityAuthPage) {
    const role = await getRole();
    if (role === "authority") {
      return NextResponse.redirect(new URL("/authority/dashboard", req.url));
    }
    // Non-authority signed in? Let them through — they may be upgrading their account.
    return NextResponse.next();
  }

  // ── Signed-in AUTHORITY users hitting citizen auth pages → go to dashboard ──
  if (userId && isCitizenAuthPage) {
    const role = await getRole();
    if (role === "authority") {
      return NextResponse.redirect(new URL("/authority/dashboard", req.url));
    }
  }

  // ── Citizen setup page requires auth ──
  if (isCitizenSetupPage && !userId) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // ── Unauthenticated access to protected citizen routes ──
  if (isProtectedCitizenRoute && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── Unauthenticated access to protected authority routes ──
  if (isAuthorityProtectedRoute && !userId) {
    const signInUrl = new URL("/authority/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── Authenticated but wrong role trying to access authority-only routes ──
  if (isAuthorityProtectedRoute && userId) {
    const role = await getRole();
    if (role !== "authority") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
