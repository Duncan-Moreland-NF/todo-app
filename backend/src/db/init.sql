-- Database initialisation script
-- Creates the todos table and supporting indexes

CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for sorting by created_at (newest first)
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos (created_at DESC);
