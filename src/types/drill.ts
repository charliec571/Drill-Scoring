export type Division = 'ARMED' | 'UNARMED';
export type EventCategory = 'INSPECTION' | 'REGULATION' | 'COLOR_GUARD' | 'EXHIBITION';
export type ScorecardStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED';
export type UserRoleType = 'ADMIN' | 'JUDGE';

export interface UserRole {
  user_id: string;
  role: UserRoleType;
}

export interface School {
  id: string;
  name: string;
  brigade: string; // e.g. "1st Brigade", "4th Brigade", etc.
  contact_instructor: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface Team {
  id: string;
  school_id: string;
  school_name?: string;
  brigade?: string;
  division: Division;
  cadet_count: number;
  commander_name: string;
  created_at?: string;
}

export interface Judge {
  id: string;
  user_id: string;
  full_name: string;
  assigned_event_id?: string;
  judge_number: number; // 1 = Head Judge, 2 = Judge #2, etc.
  is_head_judge: boolean;
  assigned_event?: EventCategory;
  drill_pad?: string;
  rank_or_title?: string;
  created_at?: string;
}

export interface DrillEvent {
  id: string;
  division: Division;
  category: EventCategory;
  name: string;
  max_cadets: number;
  min_cadets: number;
  time_limit_min_sec: number; // in seconds
  time_limit_max_sec: number; // in seconds
  time_limit_min?: number; // alias
  time_limit_max?: number; // alias
  created_at?: string;
}

export interface CriteriaItemScore {
  criteria_id: string;
  label: string;
  max_points: number;
  score: number;
  notes?: string;
}

export interface Scorecard {
  id: string;
  team_id: string;
  judge_id: string;
  event_id: string;
  status: ScorecardStatus;
  raw_score: number;
  overall_knowledge_score: number; // Head Judge Inspection Tie-breaker #3
  uniform_appearance_score: number; // Head Judge Inspection Tie-breaker #4
  criteria_breakdown: Record<string, number>; // Detail Breakdown per TC 3-21.5
  criteria_scores?: Record<string, number>; // alias
  is_head_judge?: boolean;
  signature_name?: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PenaltyRecord {
  id: string;
  team_id: string;
  event_id: string;
  head_judge_id: string;
  missing_cadet_count: number; // -25 pts per missing cadet
  pause_violation_count: number; // -5 pts per failed 5-sec pause
  boundary_violations: number; // -10 pts per violation
  time_under_over_seconds: number; // -1 pt per second
  total_penalty_deduction: number;
  scorecard_id?: string; // alias
  elapsed_time_seconds?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinalEventResult {
  id: string;
  team_id: string;
  event_id: string;
  total_raw_score: number;
  total_penalties: number;
  final_score: number;
  head_judge_raw_score: number;
  judge_2_raw_score: number;
  hj_knowledge_score: number;
  hj_uniform_score: number;
  event_rank?: number;
  updated_at?: string;
}

export interface ViewEventRanking {
  result_id: string;
  team_id: string;
  school_id: string;
  school_name: string;
  division: Division;
  category: EventCategory;
  event_name: string;
  total_raw_score: number;
  total_penalties: number;
  final_score: number;
  head_judge_raw_score: number;
  judge_2_raw_score: number;
  hj_knowledge_score: number;
  hj_uniform_score: number;
  event_rank: number;
}

export interface ViewOverallChampionshipStanding {
  team_id: string;
  school_name: string;
  division: Division;
  commander_name: string;
  total_championship_points: number;
  events_completed: number;
  count_1st_places: number;
  count_2nd_places: number;
  count_3rd_places: number;
  overall_rank: number;
}

export interface FinalResult {
  id: string;
  team_id: string;
  team_name?: string;
  school_name?: string;
  brigade?: string;
  division: Division;
  event_id: string;
  event_category: EventCategory;
  judge_raw_scores: {
    judge_id: string;
    judge_name: string;
    judge_number?: number;
    is_head_judge: boolean;
    raw_score: number;
    overall_knowledge?: number;
    uniform_appearance?: number;
  }[];
  total_raw_score: number;
  total_penalties: number;
  final_score: number;
  head_judge_raw_score?: number;
  judge_2_raw_score?: number;
  hj_knowledge_score?: number;
  hj_uniform_score?: number;
  event_rank: number;
  overall_rank?: number;
  tie_broken: boolean;
  tie_break_reason?: string;
  updated_at: string;
}

export interface DrillScheduleItem {
  id: string;
  team_id: string;
  event_id: string;
  drill_pad: string;
  scheduled_time: string; // e.g. "08:30"
  completed: boolean;
}

export interface OverallChampionshipStanding {
  team_id: string;
  school_name: string;
  brigade: string;
  division: Division;
  commander_name: string;
  total_championship_score: number;
  event_finishes: {
    [key in EventCategory]?: {
      rank: number;
      final_score: number;
      raw_score: number;
      penalties: number;
    };
  };
  first_place_count: number;
  second_place_count: number;
  third_place_count: number;
  overall_rank: number;
  tie_broken: boolean;
  tie_break_reason?: string;
}
