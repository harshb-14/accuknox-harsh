/*
  # Fix image deletion cascade

  1. Changes
    - Add ON DELETE CASCADE to scan_history foreign key
    - Add ON DELETE CASCADE to container_images foreign key
    - Re-enable RLS policies to ensure proper deletion permissions

  2. Security
    - Maintain existing RLS policies
    - Add delete policy for container_images
*/

-- Add delete policy for container_images
CREATE POLICY "Users can delete their own images"
  ON container_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add delete policy for scan_history
CREATE POLICY "Users can delete their own scan history"
  ON scan_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);