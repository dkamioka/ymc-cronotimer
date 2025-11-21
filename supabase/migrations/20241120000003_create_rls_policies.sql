-- ============================================
-- RLS POLICIES FOR MULTI-TENANT ISOLATION
-- ============================================

-- Helper function: Get current user's box_id
CREATE OR REPLACE FUNCTION auth.user_box_id()
RETURNS UUID AS $$
  SELECT box_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- BOXES TABLE POLICIES
-- ============================================

-- Users can view their own box
CREATE POLICY "users_can_view_own_box"
  ON public.boxes
  FOR SELECT
  USING (
    id IN (SELECT box_id FROM public.users WHERE id = auth.uid())
  );

-- Only owners can update their box
CREATE POLICY "owners_can_update_own_box"
  ON public.boxes
  FOR UPDATE
  USING (
    id IN (
      SELECT box_id FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view users in their box
CREATE POLICY "users_can_view_box_members"
  ON public.users
  FOR SELECT
  USING (box_id = auth.user_box_id());

-- Owners and coaches can insert new users in their box
CREATE POLICY "owners_coaches_can_add_users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Only owners can update users
CREATE POLICY "owners_can_update_users"
  ON public.users
  FOR UPDATE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Only owners can delete users
CREATE POLICY "owners_can_delete_users"
  ON public.users
  FOR DELETE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- WORKOUTS TABLE POLICIES
-- ============================================

-- Users can view workouts from their box
CREATE POLICY "users_can_view_box_workouts"
  ON public.workouts
  FOR SELECT
  USING (box_id = auth.user_box_id());

-- Coaches and owners can create workouts
CREATE POLICY "coaches_owners_can_create_workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Coaches and owners can update workouts in their box
CREATE POLICY "coaches_owners_can_update_workouts"
  ON public.workouts
  FOR UPDATE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- Coaches and owners can delete workouts in their box
CREATE POLICY "coaches_owners_can_delete_workouts"
  ON public.workouts
  FOR DELETE
  USING (
    box_id = auth.user_box_id()
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('owner', 'coach')
    )
  );

-- ============================================
-- SECTIONS, EXERCISES, ROUNDS POLICIES
-- (Inherit isolation from parent workout via FK)
-- ============================================

-- Sections: Users can view sections from workouts in their box
CREATE POLICY "users_can_view_sections"
  ON public.sections
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_sections"
  ON public.sections
  FOR ALL
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Exercises: Same pattern
CREATE POLICY "users_can_view_exercises"
  ON public.exercises
  FOR SELECT
  USING (
    section_id IN (
      SELECT s.id FROM public.sections s
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_exercises"
  ON public.exercises
  FOR ALL
  USING (
    section_id IN (
      SELECT s.id FROM public.sections s
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Rounds: Same pattern
CREATE POLICY "users_can_view_rounds"
  ON public.rounds
  FOR SELECT
  USING (
    exercise_id IN (
      SELECT e.id FROM public.exercises e
      JOIN public.sections s ON e.section_id = s.id
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
  );

CREATE POLICY "coaches_owners_can_manage_rounds"
  ON public.rounds
  FOR ALL
  USING (
    exercise_id IN (
      SELECT e.id FROM public.exercises e
      JOIN public.sections s ON e.section_id = s.id
      JOIN public.workouts w ON s.workout_id = w.id
      WHERE w.box_id = auth.user_box_id()
    )
    AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- ============================================
-- EXECUTION LOGS POLICIES
-- ============================================

-- All users can view execution logs from their box
CREATE POLICY "users_can_view_execution_logs"
  ON public.execution_logs
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );

-- All users can create execution logs (when executing workouts)
CREATE POLICY "users_can_create_execution_logs"
  ON public.execution_logs
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE box_id = auth.user_box_id()
    )
  );
