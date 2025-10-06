-- Create policy for product-images bucket to allow uploads
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Create policy to allow public access to images
CREATE POLICY "Allow public access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');