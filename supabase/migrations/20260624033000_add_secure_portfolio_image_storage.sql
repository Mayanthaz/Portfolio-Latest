INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete portfolio images" ON storage.objects;

CREATE POLICY "Public can view portfolio images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Admin can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND name = 'header/avatar'
    AND public.is_admin()
  );

CREATE POLICY "Admin can update portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND name = 'header/avatar'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND name = 'header/avatar'
    AND public.is_admin()
  );

CREATE POLICY "Admin can delete portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND name = 'header/avatar'
    AND public.is_admin()
  );
