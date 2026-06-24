-- RLS policies call public.is_admin() while running as the authenticated user.
-- The previous migration revoked this permission, causing every admin write to fail.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
