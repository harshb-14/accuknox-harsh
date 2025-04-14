/*
  # Container Scanner Database Schema

  1. New Tables
    - `container_images`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `registry_url` (text)
      - `critical_vulnerabilities` (integer)
      - `high_vulnerabilities` (integer)
      - `medium_vulnerabilities` (integer)
      - `status` (text)
      - `last_scan` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, foreign key)

    - `scan_history`
      - `id` (uuid, primary key)
      - `image_id` (uuid, foreign key)
      - `status` (text)
      - `scan_started_at` (timestamptz)
      - `scan_completed_at` (timestamptz)
      - `vulnerabilities_found` (jsonb)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create container_images table
CREATE TABLE container_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  registry_url text,
  critical_vulnerabilities integer DEFAULT 0,
  high_vulnerabilities integer DEFAULT 0,
  medium_vulnerabilities integer DEFAULT 0,
  status text DEFAULT 'pending',
  last_scan timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Create scan_history table
CREATE TABLE scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES container_images(id) ON DELETE CASCADE,
  status text NOT NULL,
  scan_started_at timestamptz DEFAULT now(),
  scan_completed_at timestamptz,
  vulnerabilities_found jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE container_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Policies for container_images
CREATE POLICY "Users can view their own images"
  ON container_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON container_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON container_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for scan_history
CREATE POLICY "Users can view their own scan history"
  ON scan_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert scan history"
  ON scan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_container_images_updated_at
  BEFORE UPDATE ON container_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE container_images;
ALTER PUBLICATION supabase_realtime ADD TABLE scan_history;