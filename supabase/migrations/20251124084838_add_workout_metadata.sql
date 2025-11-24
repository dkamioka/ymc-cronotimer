-- Add favorite and last_executed_at fields to workouts table
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMPTZ;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_workouts_is_favorite ON workouts(box_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_workouts_last_executed ON workouts(box_id, last_executed_at DESC);

-- Add comment
COMMENT ON COLUMN workouts.is_favorite IS 'Marks workout as favorite for quick access';
COMMENT ON COLUMN workouts.last_executed_at IS 'Timestamp of last execution on TV';
