-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.boxes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  tags TEXT[],
  is_template BOOLEAN DEFAULT FALSE,
  total_duration INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(box_id, slug)
);

-- Create indexes
CREATE INDEX idx_workouts_box_id ON public.workouts(box_id);
CREATE INDEX idx_workouts_date ON public.workouts(date);
CREATE INDEX idx_workouts_slug ON public.workouts(slug);
CREATE INDEX idx_workouts_tags ON public.workouts USING GIN(tags);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  color TEXT,
  repeat_count INTEGER DEFAULT 1,
  exclude_from_total BOOLEAN DEFAULT FALSE
);

-- Create index
CREATE INDEX idx_sections_workout_id ON public.sections(workout_id);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  "order" INTEGER NOT NULL
);

-- Create index
CREATE INDEX idx_exercises_section_id ON public.exercises(section_id);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create rounds table
CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  duration INTERVAL NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('countup', 'countdown')),
  color TEXT,
  exclude_from_total BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL
);

-- Create index
CREATE INDEX idx_rounds_exercise_id ON public.rounds(exercise_id);

-- Enable RLS
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create execution_logs table
CREATE TABLE IF NOT EXISTS public.execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  planned_duration INTERVAL NOT NULL,
  actual_duration INTERVAL NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL
);

-- Create indexes
CREATE INDEX idx_execution_logs_workout_id ON public.execution_logs(workout_id);
CREATE INDEX idx_execution_logs_started_at ON public.execution_logs(started_at);

-- Enable RLS
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to workouts table
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
