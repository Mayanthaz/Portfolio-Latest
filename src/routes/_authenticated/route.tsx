import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    // Only a real Supabase session whose user passes the server-side is_admin()
    // check gets in. There is no client-side flag or fallback.
    if (!error && data.user) {
      const { data: isAdmin, error: authorizationError } = await supabase.rpc("is_admin");
      if (!authorizationError && isAdmin) {
        return { user: data.user };
      }
    }

    // Not authorised
    if (data?.user) await supabase.auth.signOut();
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
