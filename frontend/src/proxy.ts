import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;


  const accessToken = req.cookies.get("accessToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);


  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }


  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/sign-in",
    "/sign-up",
  ],
};