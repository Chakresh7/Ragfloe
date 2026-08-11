import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Auth-aware routes only. Skip Next internals, static assets, and
     * auth callback/signout (those handle their own session exchange).
     */
    "/((?!_next/|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
