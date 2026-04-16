-- ══════════════════════════════════════════════════════════
-- STILL POINT — Supabase Database Setup
-- Run this entire file in your Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- Main logs table
-- All threshold logs go here. The summary JSONB field holds
-- the structured data specific to each threshold type.

CREATE TABLE IF NOT EXISTS public.logs (
    id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    threshold_type TEXT        NOT NULL,
    meal_time      TEXT,         -- morning / midday / evening / night (meal logs only)
    training_type  TEXT,         -- boxing / lifting / general (training logs only)
    summary        JSONB       NOT NULL DEFAULT '{}',
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_logs_user_id       ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_threshold_type ON public.logs(threshold_type);
CREATE INDEX IF NOT EXISTS idx_logs_created_at    ON public.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_summary       ON public.logs USING gin(summary);

-- ── Row Level Security ──
-- Users can only see and modify their own logs

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own logs"
    ON public.logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own logs"
    ON public.logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own logs"
    ON public.logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users delete own logs"
    ON public.logs FOR DELETE
    USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════
-- REFERENCE: Summary JSON schemas by threshold type
--
-- morning: {
--   threshold_type, waking_quality, mind_state_on_waking,
--   body_sensation, early_wake_occurred, early_wake_quality,
--   dream_noted, open_notes
-- }
--
-- meal: {
--   threshold_type, meal_time, attention_quality, body_reception,
--   protein_portions, carb_portions, digestion_quality,
--   hunger_before, temperature_sensitivity, open_notes
-- }
--
-- pre_training: {
--   threshold_type, training_type, arrival_state,
--   coaching_note, open_notes
-- }
--
-- post_training: {
--   threshold_type, training_type, arrival_quality,
--   session_quality, session_type, body_needs,
--   technical_notes, qi_prana_movement, open_notes
-- }
--
-- evening: {
--   threshold_type, memorable_from_today, carrying_tonight,
--   emotional_tone, energy_pattern, liver_qi, open_notes
-- }
--
-- pre_bed: {
--   threshold_type, mind_state, setting_down, open_notes
-- }
--
-- weekly: {
--   threshold_type, is_supplemental, most_authentic_moments,
--   performing_moments, dominant_element, vata_state,
--   pitta_state, coming_week_needs, energy_alignment,
--   digestion_patterns, sleep_patterns, open_notes
-- }
-- ══════════════════════════════════════════════════════════
