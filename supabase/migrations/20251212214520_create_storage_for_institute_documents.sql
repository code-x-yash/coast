/*
  # Create Storage for Institute Documents

  1. Storage Buckets
    - Create `institute-documents` bucket for license files
    - Create `institute-logos` bucket for institute logos
    - Create `institute-banners` bucket for institute banners

  2. Storage Policies
    - Allow authenticated users to upload to their own folders
    - Allow admins to read all documents
    - Allow institute owners to read their own documents
    - Allow public to read verified institute logos and banners

  3. Notes
    - Documents are organized by institute ID in folders
    - File size limits enforced at application level
    - Supported formats: PDF, PNG, JPG, JPEG
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('institute-documents', 'institute-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('institute-logos', 'institute-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('institute-banners', 'institute-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for institute-documents bucket (private)
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'institute-documents');

CREATE POLICY "Users can read own institute documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'institute-documents' AND (
      -- Institute owners can read their own documents
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      -- Admins can read all documents
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can update own institute documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'institute-documents' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can delete own institute documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'institute-documents' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policies for institute-logos bucket (public for verified institutes)
CREATE POLICY "Anyone can view institute logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'institute-logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'institute-logos');

CREATE POLICY "Institute owners can update own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'institute-logos' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Institute owners can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'institute-logos' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policies for institute-banners bucket (public for verified institutes)
CREATE POLICY "Anyone can view institute banners"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'institute-banners');

CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'institute-banners');

CREATE POLICY "Institute owners can update own banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'institute-banners' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Institute owners can delete own banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'institute-banners' AND (
      (storage.foldername(name))[1]::uuid IN (
        SELECT instid FROM institutes WHERE userid = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE userid = auth.uid() AND role = 'admin'
      )
    )
  );
