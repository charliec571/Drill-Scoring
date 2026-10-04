import { EventCategory, Division } from '@/types/drill';

export interface CriteriaDefinition {
  id: string;
  category: EventCategory;
  division?: Division; // If undefined, applies to both
  name: string;
  description: string;
  maxPoints: number;
  isHeadJudgeSpecial?: 'knowledge' | 'uniform' | 'none';
}

export const DRILL_CRITERIA: CriteriaDefinition[] = [
  // ==========================================
  // UNIT INSPECTION CRITERIA (TC 3-21.5)
  // ==========================================
  {
    id: 'insp_cmd_report',
    category: 'INSPECTION',
    name: 'Commander Report In & Out',
    description: 'Precision of approach, salute, military greeting, verbal report, and dismissal.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_bearing',
    category: 'INSPECTION',
    name: 'Military Bearing & Posture',
    description: 'Eyes in boat, steady posture, motionless position of attention throughout inspection.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_headgear_grooming',
    category: 'INSPECTION',
    name: 'Headgear & Personal Grooming',
    description: 'Beret flash alignment, haircut/hair bun regulations, shave, hygiene compliance.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_uniform_ribbons',
    category: 'INSPECTION',
    name: 'Ribbons, Badges & Accoutrements',
    description: 'Correct order of precedence, 1/8" spacing, brass polished, cord & DUI positioning.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_gigline_fit',
    category: 'INSPECTION',
    name: 'Uniform Fit & Gig Line Alignment',
    description: 'Shirt gig line alignment with belt buckle and fly flap; trouser hem length.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_shoes',
    category: 'INSPECTION',
    name: 'Footwear & Trousers Edge',
    description: 'High gloss edge and toe shine, clean welt, lace tucking, clean trouser break.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_manual_arms',
    category: 'INSPECTION',
    division: 'ARMED',
    name: 'Weapon Inspection & Manual of Arms',
    description: 'Inspection Arms execution, bolt snap, weapon balance, cleanliness, receiver check.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'insp_open_close_ranks',
    category: 'INSPECTION',
    name: 'Open Ranks & Close Ranks Execution',
    description: 'Flawless cadence, alignment, guide execution during formation expansion and closing.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  // Head Judge Specific Inspection Items (SOP Para 5 Tie-Breakers)
  {
    id: 'insp_hj_knowledge',
    category: 'INSPECTION',
    name: 'Head Judge: Overall Knowledge Evaluation',
    description: 'Cadet responses to General Orders, Chain of Command, TC 3-21.5, and military history. (Primary Tie-Breaker #3)',
    maxPoints: 50,
    isHeadJudgeSpecial: 'knowledge',
  },
  {
    id: 'insp_hj_uniform',
    category: 'INSPECTION',
    name: 'Head Judge: Uniform Preparation & Appearance',
    description: 'Overall visual standard, starching, brass brilliance, perfection across all cadets. (Primary Tie-Breaker #4)',
    maxPoints: 50,
    isHeadJudgeSpecial: 'uniform',
  },

  // ==========================================
  // REGULATION DRILL CRITERIA (TC 3-21.5)
  // ==========================================
  {
    id: 'reg_cmd_voice',
    category: 'REGULATION',
    name: 'Commander Voice & Bearing',
    description: 'Volume, snap, inflection, cadence, posture, and commanding presence.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_alignment_cover',
    category: 'REGULATION',
    name: 'Interval, Dress & Cover',
    description: 'Maintenance of 40-inch distance and 30-inch interval during all marching movements.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_facing_movements',
    category: 'REGULATION',
    name: 'Stationary Facing Movements',
    description: 'Snap and synchronization on Right/Left Face, About Face, and Order Arms.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_cadence_step',
    category: 'REGULATION',
    name: 'Cadence (100-120 BPM) & 30-Inch Step',
    description: 'Precise step cadence, proper arm swing (9 inches front, 6 inches rear), locked elbows.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_column_turns',
    category: 'REGULATION',
    name: 'Column Movements & Pivot Precision',
    description: 'Execution of Column Right/Left, Column Half Right/Left, and proper glance/dress.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_flanking_rear',
    category: 'REGULATION',
    name: 'Flanking Movements & Rear March',
    description: 'Simultaneous pivot and instantaneous pickup of step without cadence loss.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_manual_arms',
    category: 'REGULATION',
    division: 'ARMED',
    name: 'Armed Manual of Arms Precision',
    description: 'Port Arms, Right Shoulder Arms, Left Shoulder Arms, and Present Arms sharpness.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_pause_discipline',
    category: 'REGULATION',
    name: 'Command Pause Discipline (BOLD Commands)',
    description: 'Unit holds stillness and allows mandatory 5-second pause on prescribed bold commands.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_report_protocol',
    category: 'REGULATION',
    name: 'Report In & Report Out Precision',
    description: 'Centering on Head Judge, saluting simultaneously with verbal report formulation.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'reg_unit_bearing',
    category: 'REGULATION',
    name: 'Overall Military Discipline & Bearing',
    description: 'Impeccable discipline, no flinching, consistent head and eye discipline throughout.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },

  // ==========================================
  // COLOR GUARD CRITERIA (TC 3-21.5)
  // ==========================================
  {
    id: 'cg_uncasing_casing',
    category: 'COLOR_GUARD',
    name: 'Uncasing & Casing of Colors Protocol',
    description: 'Dignified handling of National and State/Organizational colors, tucking, ribbon management.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_synchronization',
    category: 'COLOR_GUARD',
    name: 'Guard & Bearer Synchronization',
    description: 'Flawless simultaneous movement between rifle guards and flag bearers.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_carriage_posture',
    category: 'COLOR_GUARD',
    name: 'Colors Carriage & Socket Placement',
    description: 'Proper sling tension, harness seating, socket height, and vertical staff alignment.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_wheel_movements',
    category: 'COLOR_GUARD',
    name: 'Left/Right About March & Wheels',
    description: 'Even wheeling arc, pivot point discipline, unbroken line during redirection.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_present_order',
    category: 'COLOR_GUARD',
    name: 'Present Colors & Order Colors',
    description: 'National flag remains erect, organizational flag dips gracefully per TC 3-21.5 rules.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_eyes_right',
    category: 'COLOR_GUARD',
    name: 'Eyes Right & Ready Front',
    description: 'Head snap on prescribed step; National color bearer maintains forward eyes.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_boundary_discipline',
    category: 'COLOR_GUARD',
    name: 'Drill Pad Boundary & Space Control',
    description: 'Command anticipation and space management avoiding cones and tape boundaries.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'cg_commander_control',
    category: 'COLOR_GUARD',
    name: 'Commander Control & Command Voice',
    description: 'Cadence and command projection while marching and maintaining position.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },

  // ==========================================
  // EXHIBITION DRILL CRITERIA (TC 3-21.5 & SOP)
  // ==========================================
  {
    id: 'exh_originality',
    category: 'EXHIBITION',
    name: 'Originality & Showmanship',
    description: 'Creative choreography, dynamic sequences, unique squad/platoon formations.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_precision',
    category: 'EXHIBITION',
    name: 'Precision & Uniformity',
    description: 'Pinpoint coordination, uniform angles, instantaneous stops, and unison clicks.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_difficulty',
    category: 'EXHIBITION',
    name: 'Movement Complexity & Difficulty',
    description: 'High-risk exchanges, rapid direction reversals, intricate sequential ripples.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_military_bearing',
    category: 'EXHIBITION',
    name: 'Military Bearing & Flavor',
    description: 'Routines adhere to Army drill dignity without inappropriate street or dance elements.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_cadence_variation',
    category: 'EXHIBITION',
    name: 'Cadence Variation & Step Dynamics',
    description: 'Mastery of slow-time, quick-time, double-time, and silent syncopated footwork.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_rifle_manipulation',
    category: 'EXHIBITION',
    division: 'ARMED',
    name: 'Rifle Spins, Tosses & Catching Sharpness',
    description: 'Clean handoffs, spinning velocity, overhead tosses, and flawless recovery.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_floor_coverage',
    category: 'EXHIBITION',
    name: 'Floor Coverage & Boundary Awareness',
    description: 'Utilizing all drill pad sectors effectively without boundary line violations.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
  {
    id: 'exh_report_protocol',
    category: 'EXHIBITION',
    name: 'Report In & Report Out Execution',
    description: 'Crisp military salute and report formulation at start and finish within time window.',
    maxPoints: 10,
    isHeadJudgeSpecial: 'none',
  },
];

export function getCriteriaForEvent(category: EventCategory, division: Division, isHeadJudge: boolean): CriteriaDefinition[] {
  return DRILL_CRITERIA.filter((c) => {
    if (c.category !== category) return false;
    if (c.division && c.division !== division) return false;
    // Only head judges evaluate the special tie-breaker knowledge and uniform totals
    if (c.isHeadJudgeSpecial !== 'none' && !isHeadJudge) return false;
    return true;
  });
}
