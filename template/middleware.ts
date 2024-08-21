export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images from public directory)
     * - gif (static gifs from public directory)
     * - auth (auth pages)
     * Also do not match home path
     */
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|gif|auth|$).*)"],
};

export { auth as middleware } from "@/auth";
