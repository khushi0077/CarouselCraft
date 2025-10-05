/*
  # Create Carousel Posts Table for Platform Publishing

  1. New Tables
    - `carousel_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `platform` (text: instagram, linkedin, tiktok)
      - `status` (text: draft, scheduled, published)
      - `slides_data` (jsonb - stores slide content)
      - `caption` (text)
      - `hashtags` (text array)
      - `scheduled_for` (timestamptz, nullable)
      - `published_at` (timestamptz, nullable)
      - `template_settings` (jsonb - stores template, colors, fonts)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `carousel_posts` table
    - Add policies for authenticated users to manage their own posts
*/

CREATE TABLE IF NOT EXISTS carousel_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  slides_data jsonb NOT NULL,
  caption text,
  hashtags text[],
  scheduled_for timestamptz,
  published_at timestamptz,
  template_settings jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carousel_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own carousel posts"
  ON carousel_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own carousel posts"
  ON carousel_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carousel posts"
  ON carousel_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own carousel posts"
  ON carousel_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_carousel_posts_user_id ON carousel_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_carousel_posts_status ON carousel_posts(status);
CREATE INDEX IF NOT EXISTS idx_carousel_posts_scheduled_for ON carousel_posts(scheduled_for);
