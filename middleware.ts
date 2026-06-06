export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/catalogue/:path*",
    "/orders/:path*",
    "/dashboard/:path*",
  ],
};
