-- Keep authorization inside PostgreSQL. Client-side route checks are only UX.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND encode(
      extensions.digest(
        convert_to(lower(coalesce(auth.jwt() ->> 'email', '')), 'UTF8'),
        'sha256'
      ),
      'hex'
    ) = '5707013f5c5b7818f7f608748214ebd19f9621750736c0cacce6b8ed9da2e345';
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON TABLE public.site_content FROM anon, authenticated;
GRANT SELECT ON TABLE public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_content TO authenticated;

DROP POLICY IF EXISTS "Anyone can read site content" ON public.site_content;
DROP POLICY IF EXISTS "Admin can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admin can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admin can delete site content" ON public.site_content;

CREATE POLICY "Public content is readable"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only the approved admin can insert content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only the approved admin can update content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only the approved admin can delete content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (public.is_admin());
