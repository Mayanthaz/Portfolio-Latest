DROP POLICY IF EXISTS "Admin can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete portfolio images" ON storage.objects;

CREATE POLICY "Admin can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND name IN ('header/avatar', 'site/favicon')
    AND public.is_admin()
  );

CREATE POLICY "Admin can update portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND name IN ('header/avatar', 'site/favicon')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND name IN ('header/avatar', 'site/favicon')
    AND public.is_admin()
  );

CREATE POLICY "Admin can delete portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND name IN ('header/avatar', 'site/favicon')
    AND public.is_admin()
  );
