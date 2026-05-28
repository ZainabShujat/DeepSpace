import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // cookie helpers for server-side
  const getAll = () => {
    const header = req.headers.get("cookie") || "";
    if (!header) return [];
    return header.split(";").map((c) => {
      const [name, ...rest] = c.split("=");
      return { name: name.trim(), value: decodeURIComponent(rest.join("=").trim()) };
    });
  };

  const setAll = (cookies: { name: string; value: string; options: any }[]) => {
    for (const c of cookies) {
      let str = `${c.name}=${encodeURIComponent(c.value)}`;
      const opts = c.options || {};
      if (opts.maxAge !== undefined) str += `; Max-Age=${opts.maxAge}`;
      if (opts.domain) str += `; Domain=${opts.domain}`;
      if (opts.path) str += `; Path=${opts.path}`;
      else str += `; Path=/`;
      if (opts.httpOnly) str += `; HttpOnly`;
      if (opts.secure) str += `; Secure`;
      if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
      // append Set-Cookie header
      res.headers.append("set-cookie", str);
    }
  };

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll,
      setAll,
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isGuest = req.cookies.get("deepspace-guest")?.value === "true";

  const protectedPaths = ["/lobby", "/room"];

  const pathname = req.nextUrl.pathname;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && !session && !isGuest) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/lobby/:path*", "/room/:path*"],
};
