import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is signed in and trying to access auth pages, redirect to profile
  if (
    session &&
    (request.nextUrl.pathname === paths.signIn ||
      request.nextUrl.pathname === paths.createAccount)
  ) {
    return NextResponse.redirect(new URL(paths.profile, request.url));
  }

  // If user is not signed in and trying to access protected pages, redirect to sign in
  // Handled by Auth Guard in the app layout

  // If user is signed in and on the root page, redirect to profile
  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(paths.profile, request.url));
  }

  // If user is not signed in and on the root page, redirect to home
  if (!session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(paths.home, request.url));
  }

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
