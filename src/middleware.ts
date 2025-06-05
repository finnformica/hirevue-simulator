import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClientForServer();
  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is signed in and trying to access auth pages, redirect to profile
  if (
    user &&
    (request.nextUrl.pathname === paths.signIn ||
      request.nextUrl.pathname === paths.createAccount)
  ) {
    return NextResponse.redirect(new URL(paths.profile, request.url));
  }

  // If user is not signed in and trying to access protected pages, redirect to sign in
  // Handled by Auth Guard in the app layout

  // If user is signed in and on the root page, redirect to profile
  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(paths.profile, request.url));
  }

  // If user is not signed in and on the root page, redirect to home
  if (!user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(paths.home, request.url));
  }

  // If user is not signed in and trying to access /api routes, return 401
  if (!user && request.nextUrl.pathname.startsWith("/api/")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const response = NextResponse.next({ request: { headers: request.headers } });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
