/*
  # Add user_id to tasks table

  1. Changes
    - Add `user_id` column to `tasks` table
    - Update RLS policies to restrict access based on user_id

  2. Security
    - Enable RLS on tasks table
    - Add policy for authenticated users to manage their own tasks only
*/

-- Add user_id column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing policy
DROP POLICY IF EXISTS "Allow public access to tasks" ON tasks;

-- Create new RLS policy for authenticated users
CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);