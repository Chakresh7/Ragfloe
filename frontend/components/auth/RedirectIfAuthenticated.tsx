"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * If the session is still valid (including bfcache / browser Back to /login),
 * send the user into the app instead of showing the sign-in screen.
 */
export function RedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function redirectWhenSignedIn() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        if (!cancelled && data?.claims?.sub) {
          router.replace("/organizations");
        }
      } catch {
        // Stay on login if session check fails.
      }
    }

    void redirectWhenSignedIn();

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void redirectWhenSignedIn();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
