/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `completed` (boolean, default false)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for public access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- For demo purposes, allow public access
CREATE POLICY "Allow public access to tasks"
  ON tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);