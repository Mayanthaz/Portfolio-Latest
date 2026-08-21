import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    
    // Try Supabase auth first
    if (!error && data.user) {
      const { data: isAdmin, error: authorizationError } = await supabase.rpc("is_admin");
      if (!authorizationError && isAdmin) {
        return { user: data.user };
      }
    }

    // Fallback: check sessionStorage passcode auth
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_authenticated") === "true") {
      return { user: data?.user ?? null };
    }

    // Neither auth method worked
    if (data?.user) await supabase.auth.signOut();
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
