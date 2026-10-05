-- ====================================================================
-- 2026 U.S. ARMY JROTC NATIONAL DRILL TEAM CHAMPIONSHIP
-- OFFICIAL SUPABASE POSTGRESQL DATABASE SCHEMA (SOP V4, FEB 2026)
-- ====================================================================

-- 1. ENUM TYPES & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE division_type AS ENUM ('ARMED', 'UNARMED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('INSPECTION', 'REGULATION', 'COLOR_GUARD', 'EXHIBITION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scorecard_status AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 2. TABLES DEFINITIONS
-- ====================================================================

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brigade TEXT NOT NULL,
    contact_instructor TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition Teams
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    division division_type NOT NULL,
    cadet_count INT NOT NULL DEFAULT 13,
    commander_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_school_division UNIQUE (school_id, division)
);

-- Competition Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division division_type NOT NULL,
    category event_category NOT NULL,
    name TEXT NOT NULL, -- e.g. "Armed Inspection"
    max_cadets INT DEFAULT 13,
    min_cadets INT DEFAULT 9,
    time_limit_min_sec INT DEFAULT 0,
    time_limit_max_sec INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_div_cat UNIQUE (division, category)
);

-- Judges Profile (tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    assigned_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    judge_number INT NOT NULL DEFAULT 1, -- 1 = Head Judge, 2 = Judge #2, etc.
    is_head_judge BOOLEAN GENERATED ALWAYS AS (judge_number = 1) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scorecards (Individual Judge Entries)
CREATE TABLE IF NOT EXISTS public.scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES public.judges(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    status scorecard_status NOT NULL DEFAULT 'DRAFT',
    
    -- Scores & Breakdown
    raw_score DECIMAL(7,2) NOT NULL DEFAULT 0.00,
    overall_knowledge_score DECIMAL(5,2) DEFAULT 0.00, -- Head Judge Inspection Tie-breaker #3
    uniform_appearance_score DECIMAL(5,2) DEFAULT 0.00, -- Head Judge Inspection Tie-breaker #4
    criteria_breakdown JSONB DEFAULT '{}'::jsonb, -- Detail Breakdown per TC 3-21.5
    
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_team_event_judge UNIQUE (team_id, event_id, judge_id)
);

-- Penalties (Tracked primarily by Head Judge)
CREATE TABLE IF NOT EXISTS public.penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    head_judge_id UUID NOT NULL REFERENCES public.judges(id) ON DELETE RESTRICT,
    
    -- SOP Rule Penalties
    missing_cadet_count INT NOT NULL DEFAULT 0,  -- -25 pts per missing cadet
    pause_violation_count INT NOT NULL DEFAULT 0,-- -5 pts per failed 5-sec pause
    boundary_violations INT NOT NULL DEFAULT 0,  -- -10 pts per violation
    time_under_over_seconds INT NOT NULL DEFAULT 0, -- -1 pt per second
    
    -- Calculated total penalty deduction
    total_penalty_deduction DECIMAL(7,2) GENERATED ALWAYS AS (
        (missing_cadet_count * 25.00) +
        (pause_violation_count * 5.00) +
        (boundary_violations * 10.00) +
        (time_under_over_seconds * 1.00)
    ) STORED,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_team_event_penalty UNIQUE (team_id, event_id)
);

-- Consolidated Event Results Table
CREATE TABLE IF NOT EXISTS public.final_event_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    
    total_raw_score DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    total_penalties DECIMAL(7,2) NOT NULL DEFAULT 0.00,
    final_score DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    
    -- Tie Breaker Audit Fields (Head Judge / Judge #2 Scores)
    head_judge_raw_score DECIMAL(7,2) DEFAULT 0.00,
    judge_2_raw_score DECIMAL(7,2) DEFAULT 0.00,
    hj_knowledge_score DECIMAL(5,2) DEFAULT 0.00,
    hj_uniform_score DECIMAL(5,2) DEFAULT 0.00,
    
    event_rank INT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_team_event_result UNIQUE (team_id, event_id)
);

-- User Role Table for Admin Identification
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'JUDGE'))
);

-- ====================================================================
-- 3. TRIGGERS FOR SCORE CALCULATION & AGGREGATION
-- ====================================================================

CREATE OR REPLACE FUNCTION public.recalculate_event_results()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
    v_event_id UUID;
    v_total_raw DECIMAL(8,2) := 0.00;
    v_total_penalties DECIMAL(7,2) := 0.00;
    v_hj_raw DECIMAL(7,2) := 0.00;
    v_j2_raw DECIMAL(7,2) := 0.00;
    v_hj_know DECIMAL(5,2) := 0.00;
    v_hj_unif DECIMAL(5,2) := 0.00;
    v_final DECIMAL(8,2) := 0.00;
BEGIN
    -- Context extraction
    IF TG_TABLE_NAME = 'scorecards' THEN
        v_team_id := NEW.team_id;
        v_event_id := NEW.event_id;
    ELSIF TG_TABLE_NAME = 'penalties' THEN
        v_team_id := NEW.team_id;
        v_event_id := NEW.event_id;
    END IF;

    -- 1. Calculate Raw Scores Aggregate
    SELECT 
        COALESCE(SUM(s.raw_score), 0.00),
        COALESCE(MAX(CASE WHEN j.judge_number = 1 THEN s.raw_score ELSE 0 END), 0.00),
        COALESCE(MAX(CASE WHEN j.judge_number = 2 THEN s.raw_score ELSE 0 END), 0.00),
        COALESCE(MAX(CASE WHEN j.judge_number = 1 THEN s.overall_knowledge_score ELSE 0 END), 0.00),
        COALESCE(MAX(CASE WHEN j.judge_number = 1 THEN s.uniform_appearance_score ELSE 0 END), 0.00)
    INTO v_total_raw, v_hj_raw, v_j2_raw, v_hj_know, v_hj_unif
    FROM public.scorecards s
    JOIN public.judges j ON s.judge_id = j.id
    WHERE s.team_id = v_team_id 
      AND s.event_id = v_event_id 
      AND s.status = 'SUBMITTED';

    -- 2. Calculate Total Penalties
    SELECT COALESCE(SUM(total_penalty_deduction), 0.00)
    INTO v_total_penalties
    FROM public.penalties
    WHERE team_id = v_team_id AND event_id = v_event_id;

    -- 3. Final Calculation
    v_final := v_total_raw - v_total_penalties;

    -- 4. Upsert into final_event_results
    INSERT INTO public.final_event_results (
        team_id, event_id, total_raw_score, total_penalties, final_score,
        head_judge_raw_score, judge_2_raw_score, hj_knowledge_score, hj_uniform_score, updated_at
    )
    VALUES (
        v_team_id, v_event_id, v_total_raw, v_total_penalties, v_final,
        v_hj_raw, v_j2_raw, v_hj_know, v_hj_unif, NOW()
    )
    ON CONFLICT (team_id, event_id) DO UPDATE SET
        total_raw_score = EXCLUDED.total_raw_score,
        total_penalties = EXCLUDED.total_penalties,
        final_score = EXCLUDED.final_score,
        head_judge_raw_score = EXCLUDED.head_judge_raw_score,
        judge_2_raw_score = EXCLUDED.judge_2_raw_score,
        hj_knowledge_score = EXCLUDED.hj_knowledge_score,
        hj_uniform_score = EXCLUDED.hj_uniform_score,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on Scorecards modification
DROP TRIGGER IF EXISTS trigger_update_scorecards_result ON public.scorecards;
CREATE TRIGGER trigger_update_scorecards_result
AFTER INSERT OR UPDATE ON public.scorecards
FOR EACH ROW EXECUTE FUNCTION public.recalculate_event_results();

-- Trigger on Penalties modification
DROP TRIGGER IF EXISTS trigger_update_penalties_result ON public.penalties;
CREATE TRIGGER trigger_update_penalties_result
AFTER INSERT OR UPDATE ON public.penalties
FOR EACH ROW EXECUTE FUNCTION public.recalculate_event_results();

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS across all domain tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_event_results ENABLE ROW LEVEL SECURITY;

-- Helper Function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- READ-ONLY Access to Master Data for Authenticated Users
DROP POLICY IF EXISTS "Allow read master data" ON public.schools;
CREATE POLICY "Allow read master data" ON public.schools FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow read teams" ON public.teams;
CREATE POLICY "Allow read teams" ON public.teams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow read events" ON public.events;
CREATE POLICY "Allow read events" ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow read judges" ON public.judges;
CREATE POLICY "Allow read judges" ON public.judges FOR SELECT TO authenticated USING (true);

-- ADMIN: Full Access Rules
DROP POLICY IF EXISTS "Admin full access schools" ON public.schools;
CREATE POLICY "Admin full access schools" ON public.schools FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access teams" ON public.teams;
CREATE POLICY "Admin full access teams" ON public.teams FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access events" ON public.events;
CREATE POLICY "Admin full access events" ON public.events FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access judges" ON public.judges;
CREATE POLICY "Admin full access judges" ON public.judges FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access scorecards" ON public.scorecards;
CREATE POLICY "Admin full access scorecards" ON public.scorecards FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access penalties" ON public.penalties;
CREATE POLICY "Admin full access penalties" ON public.penalties FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access results" ON public.final_event_results;
CREATE POLICY "Admin full access results" ON public.final_event_results FOR ALL TO authenticated USING (public.is_admin());

-- JUDGE: Scorecard Policies
DROP POLICY IF EXISTS "Judge read own scorecards" ON public.scorecards;
CREATE POLICY "Judge read own scorecards" ON public.scorecards
    FOR SELECT TO authenticated
    USING (judge_id IN (SELECT id FROM public.judges WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Judge insert draft scorecard" ON public.scorecards;
CREATE POLICY "Judge insert draft scorecard" ON public.scorecards
    FOR INSERT TO authenticated
    WITH CHECK (
        judge_id IN (SELECT id FROM public.judges WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Judge update own draft scorecard" ON public.scorecards;
CREATE POLICY "Judge update own draft scorecard" ON public.scorecards
    FOR UPDATE TO authenticated
    USING (
        judge_id IN (SELECT id FROM public.judges WHERE user_id = auth.uid())
        AND status = 'DRAFT'
    );

-- HEAD JUDGE: Penalties Policies
DROP POLICY IF EXISTS "Head Judge manage penalties" ON public.penalties;
CREATE POLICY "Head Judge manage penalties" ON public.penalties
    FOR ALL TO authenticated
    USING (
        head_judge_id IN (
            SELECT id FROM public.judges WHERE user_id = auth.uid() AND is_head_judge = true
        )
    );

-- ====================================================================
-- 5. VIEWS: EVENT & OVERALL CHAMPIONSHIP TIE BREAKERS
-- ====================================================================

-- 1. INDIVIDUAL EVENT RANKINGS & TIE BREAKERS
-- SOP Paragraph 5b (Event Tie Breakers):
--   1. Highest raw score recorded by Head Judge
--   2. Highest raw score recorded by Judge #2
--   3. Highest Head Judge score on "Overall Knowledge" (Inspection)
--   4. Highest Head Judge score on "Uniform Preparation and Appearance" (Inspection)

CREATE OR REPLACE VIEW public.view_event_rankings AS
WITH event_scores AS (
    SELECT 
        fer.id AS result_id,
        fer.team_id,
        fer.event_id,
        t.school_id,
        s.name AS school_name,
        t.division,
        e.category,
        e.name AS event_name,
        fer.total_raw_score,
        fer.total_penalties,
        fer.final_score,
        fer.head_judge_raw_score,
        fer.judge_2_raw_score,
        fer.hj_knowledge_score,
        fer.hj_uniform_score
    FROM public.final_event_results fer
    JOIN public.teams t ON fer.team_id = t.id
    JOIN public.schools s ON t.school_id = s.id
    JOIN public.events e ON fer.event_id = e.id
)
SELECT 
    result_id,
    team_id,
    event_id,
    school_id,
    school_name,
    division,
    category,
    event_name,
    total_raw_score,
    total_penalties,
    final_score,
    head_judge_raw_score,
    judge_2_raw_score,
    hj_knowledge_score,
    hj_uniform_score,
    -- Rank by Final Score, then apply SOP Event Tie Breakers
    DENSE_RANK() OVER (
        PARTITION BY event_id
        ORDER BY 
            final_score DESC,
            head_judge_raw_score DESC,
            judge_2_raw_score DESC,
            hj_knowledge_score DESC,
            hj_uniform_score DESC
    ) AS event_rank
FROM event_scores;


-- ====================================================================
-- 2. OVERALL CHAMPIONSHIP STANDINGS & TIE BREAKERS
-- SOP Paragraph 5a (Overall Championship Tie Breakers):
--   1. Highest number of 1st place finishes across the 4 events
--   2. Highest number of 2nd place finishes across the 4 events
--   3. Highest number of 3rd place finishes across the 4 events
-- ====================================================================

CREATE OR REPLACE VIEW public.view_overall_championship_standings AS
WITH placement_counts AS (
    SELECT 
        er.team_id,
        er.division,
        COUNT(CASE WHEN er.event_rank = 1 THEN 1 END) AS first_place_count,
        COUNT(CASE WHEN er.event_rank = 2 THEN 1 END) AS second_place_count,
        COUNT(CASE WHEN er.event_rank = 3 THEN 1 END) AS third_place_count,
        SUM(er.final_score) AS overall_accumulated_score,
        COUNT(er.event_id) AS events_completed
    FROM public.view_event_rankings er
    GROUP BY er.team_id, er.division
)
SELECT 
    t.id AS team_id,
    s.name AS school_name,
    t.division,
    t.commander_name,
    COALESCE(pc.overall_accumulated_score, 0.00) AS total_championship_points,
    COALESCE(pc.events_completed, 0) AS events_completed,
    COALESCE(pc.first_place_count, 0) AS count_1st_places,
    COALESCE(pc.second_place_count, 0) AS count_2nd_places,
    COALESCE(pc.third_place_count, 0) AS count_3rd_places,
    
    -- Rank by Total Accumulated Score, then apply SOP Overall Tie Breakers
    DENSE_RANK() OVER (
        PARTITION BY t.division
        ORDER BY 
            COALESCE(pc.overall_accumulated_score, 0) DESC,
            COALESCE(pc.first_place_count, 0) DESC,
            COALESCE(pc.second_place_count, 0) DESC,
            COALESCE(pc.third_place_count, 0) DESC
    ) AS overall_rank
FROM public.teams t
JOIN public.schools s ON t.school_id = s.id
LEFT JOIN placement_counts pc ON t.id = pc.team_id;

