import {
  School,
  Team,
  Judge,
  DrillEvent,
  Scorecard,
  PenaltyRecord,
  DrillScheduleItem,
  FinalResult,
} from '@/types/drill';
import { tabulateTournamentResults, TabulationOutput } from './tabulation';
import { computeTotalPenalties } from './drill-sop/penalties';
import { supabase, isSupabaseConfigured } from './supabase';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Marmion Academy (Flannigan Rifles)',
    brigade: '3rd Brigade',
    contact_instructor: 'SGM (Ret) John Henderson',
    email: 'jhenderson@marmion.org',
    phone: '(630) 897-6936',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Ozark High School (Mountain Drill Team)',
    brigade: '5th Brigade',
    contact_instructor: '1SG (Ret) William Crawford',
    email: 'wcrawford@ozarktigers.org',
    phone: '(417) 582-5901',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Douglas MacArthur High School (Blue Guard)',
    brigade: '5th Brigade',
    contact_instructor: 'MSG (Ret) Carlos Reyes',
    email: 'creyes@neisd.net',
    phone: '(210) 356-7100',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Smith-Cotton High School (Black Knights)',
    brigade: '3rd Brigade',
    contact_instructor: 'SFC (Ret) Andrew Martin',
    email: 'martina@sedalia200.org',
    phone: '(660) 826-1100',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Airport High School (Golden Eagles)',
    brigade: '4th Brigade',
    contact_instructor: 'CSM (Ret) Harry Ferguson',
    email: 'hferguson@lex2.org',
    phone: '(803) 822-5600',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Theodore Roosevelt High School',
    brigade: '5th Brigade',
    contact_instructor: 'LTC (Ret) Raymond Miller',
    email: 'rmiller@neisd.net',
    phone: '(210) 356-2200',
  },
];

export const INITIAL_TEAMS: Team[] = [
  // Armed Division
  {
    id: 'aaaaaaaa-1111-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    school_name: 'Marmion Academy (Flannigan Rifles)',
    brigade: '3rd Brigade',
    division: 'ARMED',
    cadet_count: 13,
    commander_name: 'c/CPT Nicholas Thorne',
  },
  {
    id: 'aaaaaaaa-2222-0000-0000-000000000002',
    school_id: '22222222-2222-2222-2222-222222222222',
    school_name: 'Ozark High School (Mountain Drill Team)',
    brigade: '5th Brigade',
    division: 'ARMED',
    cadet_count: 13,
    commander_name: 'c/LTC Ethan Bradley',
  },
  {
    id: 'aaaaaaaa-3333-0000-0000-000000000003',
    school_id: '33333333-3333-3333-3333-333333333333',
    school_name: 'Douglas MacArthur High School (Blue Guard)',
    brigade: '5th Brigade',
    division: 'ARMED',
    cadet_count: 13,
    commander_name: 'c/MAJ Julian Garza',
  },
  {
    id: 'aaaaaaaa-4444-0000-0000-000000000004',
    school_id: '44444444-4444-4444-4444-444444444444',
    school_name: 'Smith-Cotton High School (Black Knights)',
    brigade: '3rd Brigade',
    division: 'ARMED',
    cadet_count: 12,
    commander_name: 'c/CPT Tyler Vance',
  },

  // Unarmed Division
  {
    id: 'bbbbbbbb-1111-0000-0000-000000000001',
    school_id: '22222222-2222-2222-2222-222222222222',
    school_name: 'Ozark High School (Mountain Drill Team)',
    brigade: '5th Brigade',
    division: 'UNARMED',
    cadet_count: 13,
    commander_name: 'c/CPT Savannah Wells',
  },
  {
    id: 'bbbbbbbb-2222-0000-0000-000000000002',
    school_id: '33333333-3333-3333-3333-333333333333',
    school_name: 'Douglas MacArthur High School (Blue Guard)',
    brigade: '5th Brigade',
    division: 'UNARMED',
    cadet_count: 13,
    commander_name: 'c/MAJ Gabriela Mendez',
  },
  {
    id: 'bbbbbbbb-3333-0000-0000-000000000003',
    school_id: '55555555-5555-5555-5555-555555555555',
    school_name: 'Airport High School (Golden Eagles)',
    brigade: '4th Brigade',
    division: 'UNARMED',
    cadet_count: 13,
    commander_name: 'c/CPT Courtney Price',
  },
  {
    id: 'bbbbbbbb-4444-0000-0000-000000000004',
    school_id: '66666666-6666-6666-6666-666666666666',
    school_name: 'Theodore Roosevelt High School',
    brigade: '5th Brigade',
    division: 'UNARMED',
    cadet_count: 13,
    commander_name: 'c/1LT Alyssa Ramos',
  },
];

export const INITIAL_EVENTS: DrillEvent[] = [
  {
    id: 'eeeeeeee-1111-0000-0000-000000000001',
    division: 'ARMED',
    category: 'INSPECTION',
    name: 'Armed Inspection',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 480,
    time_limit_min: 360,
    time_limit_max: 480,
  },
  {
    id: 'eeeeeeee-1111-0000-0000-000000000002',
    division: 'ARMED',
    category: 'REGULATION',
    name: 'Armed Regulation',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 480,
    time_limit_min: 360,
    time_limit_max: 480,
  },
  {
    id: 'eeeeeeee-1111-0000-0000-000000000003',
    division: 'ARMED',
    category: 'COLOR_GUARD',
    name: 'Armed Color Guard',
    max_cadets: 4,
    min_cadets: 4,
    time_limit_min_sec: 300,
    time_limit_max_sec: 420,
    time_limit_min: 300,
    time_limit_max: 420,
  },
  {
    id: 'eeeeeeee-1111-0000-0000-000000000004',
    division: 'ARMED',
    category: 'EXHIBITION',
    name: 'Armed Exhibition',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 540,
    time_limit_min: 360,
    time_limit_max: 540,
  },
  {
    id: 'eeeeeeee-2222-0000-0000-000000000001',
    division: 'UNARMED',
    category: 'INSPECTION',
    name: 'Unarmed Inspection',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 480,
    time_limit_min: 360,
    time_limit_max: 480,
  },
  {
    id: 'eeeeeeee-2222-0000-0000-000000000002',
    division: 'UNARMED',
    category: 'REGULATION',
    name: 'Unarmed Regulation',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 480,
    time_limit_min: 360,
    time_limit_max: 480,
  },
  {
    id: 'eeeeeeee-2222-0000-0000-000000000003',
    division: 'UNARMED',
    category: 'COLOR_GUARD',
    name: 'Unarmed Color Guard',
    max_cadets: 4,
    min_cadets: 4,
    time_limit_min_sec: 300,
    time_limit_max_sec: 420,
    time_limit_min: 300,
    time_limit_max: 420,
  },
  {
    id: 'eeeeeeee-2222-0000-0000-000000000004',
    division: 'UNARMED',
    category: 'EXHIBITION',
    name: 'Unarmed Exhibition',
    max_cadets: 13,
    min_cadets: 9,
    time_limit_min_sec: 360,
    time_limit_max_sec: 540,
    time_limit_min: 360,
    time_limit_max: 540,
  },
];

export const INITIAL_JUDGES: Judge[] = [
  {
    id: '99999999-1111-0000-0000-000000000001',
    user_id: '88888888-1111-0000-0000-000000000001',
    full_name: 'SGM (Ret) Marcus Vance',
    assigned_event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    judge_number: 1, // 1 = Head Judge
    is_head_judge: true,
    assigned_event: 'REGULATION',
    drill_pad: 'Pad 1',
    rank_or_title: 'Head Judge (TC 3-21.5 Evaluator)',
  },
  {
    id: '99999999-2222-0000-0000-000000000002',
    user_id: '88888888-2222-0000-0000-000000000002',
    full_name: '1SG (Ret) Robert Sterling',
    assigned_event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    judge_number: 2, // Judge #2
    is_head_judge: false,
    assigned_event: 'REGULATION',
    drill_pad: 'Pad 1',
    rank_or_title: 'Judge #2 (Marching & Cadence)',
  },
  {
    id: '99999999-3333-0000-0000-000000000003',
    user_id: '88888888-3333-0000-0000-000000000003',
    full_name: 'MSG Elena Torres',
    assigned_event_id: 'eeeeeeee-1111-0000-0000-000000000001',
    judge_number: 1,
    is_head_judge: true,
    assigned_event: 'INSPECTION',
    drill_pad: 'Pad 3',
    rank_or_title: 'Head Judge (Unit Inspection)',
  },
  {
    id: '99999999-4444-0000-0000-000000000004',
    user_id: '88888888-4444-0000-0000-000000000004',
    full_name: 'SFC David Washington',
    assigned_event_id: 'eeeeeeee-1111-0000-0000-000000000004',
    judge_number: 1,
    is_head_judge: true,
    assigned_event: 'EXHIBITION',
    drill_pad: 'Pad 2',
    rank_or_title: 'Head Judge (Platoon Exhibition)',
  },
];

export const INITIAL_SCHEDULES: DrillScheduleItem[] = [
  { id: 'sch-1', team_id: 'aaaaaaaa-1111-0000-0000-000000000001', event_id: 'eeeeeeee-1111-0000-0000-000000000002', drill_pad: 'Pad 1', scheduled_time: '08:30', completed: true },
  { id: 'sch-2', team_id: 'aaaaaaaa-2222-0000-0000-000000000002', event_id: 'eeeeeeee-1111-0000-0000-000000000002', drill_pad: 'Pad 1', scheduled_time: '09:00', completed: true },
  { id: 'sch-3', team_id: 'aaaaaaaa-3333-0000-0000-000000000003', event_id: 'eeeeeeee-1111-0000-0000-000000000002', drill_pad: 'Pad 1', scheduled_time: '09:30', completed: true },
  { id: 'sch-4', team_id: 'aaaaaaaa-4444-0000-0000-000000000004', event_id: 'eeeeeeee-1111-0000-0000-000000000002', drill_pad: 'Pad 1', scheduled_time: '10:00', completed: false },
];

export const INITIAL_SCORECARDS: Scorecard[] = [
  // Marmion Academy (Armed Regulation) - Head Judge
  {
    id: '10101010-0000-0000-0000-000000000101',
    team_id: 'aaaaaaaa-1111-0000-0000-000000000001',
    judge_id: '99999999-1111-0000-0000-000000000001',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: true,
    raw_score: 96.0,
    overall_knowledge_score: 48,
    uniform_appearance_score: 49,
    criteria_breakdown: {
      reg_cmd_voice: 10,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 10,
      reg_cadence_step: 9.5,
      reg_column_turns: 10,
      reg_flanking_rear: 9.5,
      reg_manual_arms: 10,
      reg_pause_discipline: 9.5,
      reg_report_protocol: 10,
      reg_unit_bearing: 8.0,
    },
    status: 'SUBMITTED',
    signature_name: 'SGM Marcus Vance',
    submitted_at: '2026-10-03T09:12:00Z',
    created_at: '2026-10-03T09:00:00Z',
  },
  // Marmion Academy (Armed Regulation) - Judge 2
  {
    id: '10101010-0000-0000-0000-000000000102',
    team_id: 'aaaaaaaa-1111-0000-0000-000000000001',
    judge_id: '99999999-2222-0000-0000-000000000002',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: false,
    raw_score: 94.5,
    overall_knowledge_score: 0,
    uniform_appearance_score: 0,
    criteria_breakdown: {
      reg_cmd_voice: 9.5,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 9.5,
      reg_cadence_step: 9.5,
      reg_column_turns: 9.5,
      reg_flanking_rear: 9.5,
      reg_manual_arms: 9.5,
      reg_pause_discipline: 9.5,
      reg_report_protocol: 9.5,
      reg_unit_bearing: 8.5,
    },
    status: 'SUBMITTED',
    signature_name: '1SG Robert Sterling',
    submitted_at: '2026-10-03T09:14:00Z',
    created_at: '2026-10-03T09:00:00Z',
  },

  // Ozark HS (Armed Regulation) - Head Judge
  {
    id: '20202020-0000-0000-0000-000000000201',
    team_id: 'aaaaaaaa-2222-0000-0000-000000000002',
    judge_id: '99999999-1111-0000-0000-000000000001',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: true,
    raw_score: 95.0,
    overall_knowledge_score: 47,
    uniform_appearance_score: 48,
    criteria_breakdown: {
      reg_cmd_voice: 9.5,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 9.5,
      reg_cadence_step: 9.5,
      reg_column_turns: 9.5,
      reg_flanking_rear: 9.5,
      reg_manual_arms: 9.5,
      reg_pause_discipline: 9.5,
      reg_report_protocol: 9.5,
      reg_unit_bearing: 9.0,
    },
    status: 'SUBMITTED',
    signature_name: 'SGM Marcus Vance',
    submitted_at: '2026-10-03T09:40:00Z',
    created_at: '2026-10-03T09:30:00Z',
  },
  {
    id: '20202020-0000-0000-0000-000000000202',
    team_id: 'aaaaaaaa-2222-0000-0000-000000000002',
    judge_id: '99999999-2222-0000-0000-000000000002',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: false,
    raw_score: 93.0,
    overall_knowledge_score: 0,
    uniform_appearance_score: 0,
    criteria_breakdown: {
      reg_cmd_voice: 9.0,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 9.0,
      reg_cadence_step: 9.5,
      reg_column_turns: 9.5,
      reg_flanking_rear: 9.0,
      reg_manual_arms: 9.5,
      reg_pause_discipline: 9.5,
      reg_report_protocol: 9.0,
      reg_unit_bearing: 9.5,
    },
    status: 'SUBMITTED',
    signature_name: '1SG Robert Sterling',
    submitted_at: '2026-10-03T09:42:00Z',
    created_at: '2026-10-03T09:30:00Z',
  },

  // Douglas MacArthur HS (Armed Regulation) - Head Judge: 94.0, Judge 2: 94.0 -> Final 188.0 (Ties Ozark!)
  {
    id: '30303030-0000-0000-0000-000000000301',
    team_id: 'aaaaaaaa-3333-0000-0000-000000000003',
    judge_id: '99999999-1111-0000-0000-000000000001',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: true,
    raw_score: 94.0, // Ozark HJ (95) > MacArthur HJ (94) -> Ozark wins SOP Rule 1 tie-breaker!
    overall_knowledge_score: 49,
    uniform_appearance_score: 47,
    criteria_breakdown: {
      reg_cmd_voice: 9.0,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 9.5,
      reg_cadence_step: 9.5,
      reg_column_turns: 9.5,
      reg_flanking_rear: 9.5,
      reg_manual_arms: 9.5,
      reg_pause_discipline: 9.0,
      reg_report_protocol: 9.5,
      reg_unit_bearing: 9.5,
    },
    status: 'SUBMITTED',
    signature_name: 'SGM Marcus Vance',
    submitted_at: '2026-10-03T10:15:00Z',
    created_at: '2026-10-03T10:00:00Z',
  },
  {
    id: '30303030-0000-0000-0000-000000000302',
    team_id: 'aaaaaaaa-3333-0000-0000-000000000003',
    judge_id: '99999999-2222-0000-0000-000000000002',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    is_head_judge: false,
    raw_score: 94.0,
    overall_knowledge_score: 0,
    uniform_appearance_score: 0,
    criteria_breakdown: {
      reg_cmd_voice: 9.5,
      reg_alignment_cover: 9.5,
      reg_facing_movements: 9.5,
      reg_cadence_step: 9.0,
      reg_column_turns: 9.5,
      reg_flanking_rear: 9.5,
      reg_manual_arms: 9.5,
      reg_pause_discipline: 9.0,
      reg_report_protocol: 9.5,
      reg_unit_bearing: 9.5,
    },
    status: 'SUBMITTED',
    signature_name: '1SG Robert Sterling',
    submitted_at: '2026-10-03T10:17:00Z',
    created_at: '2026-10-03T10:00:00Z',
  },
];

export const INITIAL_PENALTIES: PenaltyRecord[] = [
  {
    id: '90101010-0000-0000-0000-000000000101',
    team_id: 'aaaaaaaa-1111-0000-0000-000000000001',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    head_judge_id: '99999999-1111-0000-0000-000000000001',
    missing_cadet_count: 0,
    pause_violation_count: 0,
    boundary_violations: 0,
    time_under_over_seconds: 0,
    elapsed_time_seconds: 412,
    total_penalty_deduction: 0,
    notes: 'Flawless boundary and cadence timing compliance.',
  },
  {
    id: '90202020-0000-0000-0000-000000000201',
    team_id: 'aaaaaaaa-2222-0000-0000-000000000002',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    head_judge_id: '99999999-1111-0000-0000-000000000001',
    missing_cadet_count: 0,
    pause_violation_count: 0,
    boundary_violations: 0,
    time_under_over_seconds: 0,
    elapsed_time_seconds: 430,
    total_penalty_deduction: 0,
    notes: 'Clean execution.',
  },
  {
    id: '90303030-0000-0000-0000-000000000301',
    team_id: 'aaaaaaaa-3333-0000-0000-000000000003',
    event_id: 'eeeeeeee-1111-0000-0000-000000000002',
    head_judge_id: '99999999-1111-0000-0000-000000000001',
    missing_cadet_count: 0,
    pause_violation_count: 0,
    boundary_violations: 0,
    time_under_over_seconds: 0,
    elapsed_time_seconds: 425,
    total_penalty_deduction: 0,
    notes: 'Clean execution, within time window.',
  },
];

const STORAGE_KEYS = {
  SCORECARDS: 'jrotc_drill_scorecards_v2',
  PENALTIES: 'jrotc_drill_penalties_v2',
  SYNC_QUEUE: 'jrotc_drill_sync_queue_v2',
  TEAMS: 'jrotc_drill_teams_v2',
  SCHEDULES: 'jrotc_drill_schedules_v2',
};

export interface SyncQueueItem {
  id: string;
  type: 'scorecard' | 'penalty';
  action: 'insert' | 'update';
  payload: any;
  timestamp: string;
}

class DrillDataStore {
  private scorecards: Scorecard[] = [];
  private penalties: PenaltyRecord[] = [];
  private teams: Team[] = [];
  private schools: School[] = INITIAL_SCHOOLS;
  private judges: Judge[] = INITIAL_JUDGES;
  private events: DrillEvent[] = INITIAL_EVENTS;
  private schedules: DrillScheduleItem[] = [];
  private syncQueue: SyncQueueItem[] = [];
  private listeners: Set<() => void> = new Set();
  private isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      window.addEventListener('online', () => this.handleNetworkStatus(true));
      window.addEventListener('offline', () => this.handleNetworkStatus(false));
      this.isOnline = navigator.onLine;
    } else {
      this.scorecards = [...INITIAL_SCORECARDS];
      this.penalties = [...INITIAL_PENALTIES];
      this.teams = [...INITIAL_TEAMS];
      this.schedules = [...INITIAL_SCHEDULES];
    }
  }

  private handleNetworkStatus(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.processSyncQueue();
    }
    this.notify();
  }

  public getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      queueCount: this.syncQueue.length,
      isSupabaseLive: isSupabaseConfigured,
    };
  }

  private loadFromStorage() {
    try {
      const storedCards = localStorage.getItem(STORAGE_KEYS.SCORECARDS);
      this.scorecards = storedCards ? JSON.parse(storedCards) : [...INITIAL_SCORECARDS];

      const storedPenalties = localStorage.getItem(STORAGE_KEYS.PENALTIES);
      this.penalties = storedPenalties ? JSON.parse(storedPenalties) : [...INITIAL_PENALTIES];

      const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
      this.teams = storedTeams ? JSON.parse(storedTeams) : [...INITIAL_TEAMS];

      const storedSchedules = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      this.schedules = storedSchedules ? JSON.parse(storedSchedules) : [...INITIAL_SCHEDULES];

      const storedQueue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      this.syncQueue = storedQueue ? JSON.parse(storedQueue) : [];
    } catch (e) {
      console.error('Error loading drill data from storage:', e);
      this.scorecards = [...INITIAL_SCORECARDS];
      this.penalties = [...INITIAL_PENALTIES];
      this.teams = [...INITIAL_TEAMS];
      this.schedules = [...INITIAL_SCHEDULES];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SCORECARDS, JSON.stringify(this.scorecards));
      localStorage.setItem(STORAGE_KEYS.PENALTIES, JSON.stringify(this.penalties));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(this.teams));
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(this.schedules));
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    } catch (e) {
      console.error('Error persisting drill data:', e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getSchools(): School[] {
    return this.schools;
  }

  public getTeams(): Team[] {
    return this.teams;
  }

  public getJudges(): Judge[] {
    return this.judges;
  }

  public getEvents(): DrillEvent[] {
    return this.events;
  }

  public getSchedules(): DrillScheduleItem[] {
    return this.schedules;
  }

  public getScorecards(): Scorecard[] {
    return this.scorecards;
  }

  public getPenalties(): PenaltyRecord[] {
    return this.penalties;
  }

  public getScorecard(judgeId: string, teamId: string, eventId: string): Scorecard | undefined {
    return this.scorecards.find(
      (sc) => sc.judge_id === judgeId && sc.team_id === teamId && sc.event_id === eventId
    );
  }

  public getPenalty(teamId: string, eventId: string): PenaltyRecord | undefined {
    return this.penalties.find((p) => p.team_id === teamId && p.event_id === eventId);
  }

  public saveScorecard(card: Scorecard) {
    const idx = this.scorecards.findIndex(
      (c) => c.judge_id === card.judge_id && c.team_id === card.team_id && c.event_id === card.event_id
    );

    const normalizedCard: Scorecard = {
      ...card,
      criteria_breakdown: card.criteria_breakdown || card.criteria_scores || {},
      criteria_scores: card.criteria_breakdown || card.criteria_scores || {},
      overall_knowledge_score: card.overall_knowledge_score ?? 0,
      uniform_appearance_score: card.uniform_appearance_score ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      this.scorecards[idx] = normalizedCard;
    } else {
      this.scorecards.push({
        ...normalizedCard,
        id: normalizedCard.id || `sc-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
    }

    this.syncQueue.push({
      id: `sync-${Date.now()}`,
      type: 'scorecard',
      action: idx >= 0 ? 'update' : 'insert',
      payload: normalizedCard,
      timestamp: new Date().toISOString(),
    });

    this.saveToStorage();
    this.notify();
    this.processSyncQueue();
  }

  public savePenalty(penalty: PenaltyRecord) {
    const idx = this.penalties.findIndex(
      (p) => p.team_id === penalty.team_id && p.event_id === penalty.event_id
    );

    const calculatedTotal = computeTotalPenalties(penalty);
    const normalizedPenalty: PenaltyRecord = {
      ...penalty,
      total_penalty_deduction: calculatedTotal,
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      this.penalties[idx] = normalizedPenalty;
    } else {
      this.penalties.push({
        ...normalizedPenalty,
        id: normalizedPenalty.id || `pen-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
    }

    this.syncQueue.push({
      id: `sync-${Date.now()}`,
      type: 'penalty',
      action: idx >= 0 ? 'update' : 'insert',
      payload: normalizedPenalty,
      timestamp: new Date().toISOString(),
    });

    this.saveToStorage();
    this.notify();
    this.processSyncQueue();
  }

  public async processSyncQueue() {
    if (!isSupabaseConfigured || !supabase || this.syncQueue.length === 0) return;

    const queueCopy = [...this.syncQueue];
    for (const item of queueCopy) {
      try {
        if (item.type === 'scorecard') {
          // Push to Supabase scorecards table
          const { id, team_id, judge_id, event_id, status, raw_score, overall_knowledge_score, uniform_appearance_score, criteria_breakdown, submitted_at } = item.payload;
          await supabase.from('scorecards').upsert({
            id,
            team_id,
            judge_id,
            event_id,
            status,
            raw_score,
            overall_knowledge_score,
            uniform_appearance_score,
            criteria_breakdown,
            submitted_at,
          });
        } else if (item.type === 'penalty') {
          // Push to Supabase penalties table
          const { id, team_id, event_id, head_judge_id, missing_cadet_count, pause_violation_count, boundary_violations, time_under_over_seconds, notes } = item.payload;
          await supabase.from('penalties').upsert({
            id,
            team_id,
            event_id,
            head_judge_id,
            missing_cadet_count,
            pause_violation_count,
            boundary_violations,
            time_under_over_seconds,
            notes,
          });
        }
        this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
      } catch (err) {
        console.warn('Sync queue push delayed (offline/retry):', err);
        break;
      }
    }
    this.saveToStorage();
    this.notify();
  }

  public updateScorecardStatus(scorecardId: string, status: Scorecard['status']) {
    const card = this.scorecards.find((c) => c.id === scorecardId);
    if (card) {
      card.status = status;
      card.updated_at = new Date().toISOString();
      this.saveToStorage();
      this.notify();
    }
  }

  public getTabulation(): TabulationOutput {
    return tabulateTournamentResults({
      teams: this.teams,
      schools: this.schools,
      judges: this.judges,
      scorecards: this.scorecards,
      penalties: this.penalties,
    });
  }

  public resetToSampleBaseline() {
    this.scorecards = [...INITIAL_SCORECARDS];
    this.penalties = [...INITIAL_PENALTIES];
    this.teams = [...INITIAL_TEAMS];
    this.schedules = [...INITIAL_SCHEDULES];
    this.syncQueue = [];
    this.saveToStorage();
    this.notify();
  }
}

export const drillStore = new DrillDataStore();
