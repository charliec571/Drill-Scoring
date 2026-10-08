import json

armed = [
    (1, 'Forward March (Entrance)*', False, 'Enter drill floor together in military fashion, front/center on Head Judge'),
    (2, 'Inspection, Port, Order Arms', False, ''),
    (3, 'Verbal Report In', False, 'Commander reports in verbally to Head Judge'),
    (4, 'Attention', False, ''),
    (5, '15 Count Manual of Arms**', False, 'Right shoulder, Left shoulder, Present arms, Order arms in standard cadence'),
    (6, 'Count Off', False, ''),
    (7, 'Open Ranks, March', True, '5-Second Pause'),
    (8, 'Close Ranks, March', False, ''),
    (9, 'Left Step, March', False, ''),
    (10, 'Platoon, Halt', True, '5-Second Pause'),
    (11, 'Left, Face', False, ''),
    (12, 'Right Step, March', False, ''),
    (13, 'Platoon, Halt', True, '5-Second Pause'),
    (14, 'About, Face', False, ''),
    (15, 'Right Shoulder, Arms', False, ''),
    (16, 'Forward, March', False, ''),
    (17, 'Column Right, March', False, ''),
    (18, 'Column Right, March', False, ''),
    (19, 'Column Right, March', False, ''),
    (20, 'Left Flank, March', False, ''),
    (21, 'Right Flank, March', False, ''),
    (22, 'Platoon, Halt', True, '5-Second Pause'),
    (23, 'Column Left, March', False, ''),
    (24, 'Rear, March', False, ''),
    (25, 'Rear, March', False, ''),
    (26, 'Close Interval, March', False, ''),
    (27, 'Normal Interval, March', False, ''),
    (28, 'Platoon, Halt', True, '5-Second Pause'),
    (29, 'Port, Arms', False, ''),
    (30, 'Column Left March', False, ''),
    (31, 'Change Step, March', False, ''),
    (32, 'Mark Time, March', False, ''),
    (33, 'Forward, March', False, ''),
    (34, 'Column Left, March', False, ''),
    (35, 'Right Shoulder, Arms', False, ''),
    (36, 'Platoon, Halt', True, '5-Second Pause'),
    (37, 'Forward March', False, ''),
    (38, 'Column Left, March', False, ''),
    (39, 'Column 1/2 Left, March', False, ''),
    (40, 'Column 1/2 Left, March', False, ''),
    (41, 'Rear, March', False, ''),
    (42, 'Rear, March', False, ''),
    (43, 'Platoon, Halt', True, '5-Second Pause'),
    (44, 'Forward March', False, ''),
    (45, 'Eyes Right', False, ''),
    (46, 'Ready, Front', False, ''),
    (47, 'Column Left, March', False, ''),
    (48, 'Left Shoulder, Arms', False, ''),
    (49, 'Column Left, March', False, ''),
    (50, 'Left Flank, March', False, ''),
    (51, 'Right Flank, March', False, ''),
    (52, 'Platoon, Halt', True, '5-Second Pause'),
    (53, 'Order, Arms', False, ''),
    (54, 'Left, Face', False, ''),
    (55, 'Verbal Report Out***', False, 'Verbally report out to Head Judge'),
    (56, 'Depart Drill Floor', False, 'Depart drill floor in precise military manner'),
]

unarmed = [
    (1, 'Forward March (Entrance)*', False, 'Enter drill floor together in military fashion, front/center on Head Judge'),
    (2, 'Report In (VERBAL)', False, 'Commander reports in verbally to Head Judge'),
    (3, 'Parade Rest', True, '5-Second Pause'),
    (4, 'Attention', False, ''),
    (5, 'Present Arms', False, ''),
    (6, 'Order, Arms', False, ''),
    (7, 'Count Off', False, ''),
    (8, 'Close Interval, March', False, ''),
    (9, 'Normal Interval, March', False, ''),
    (10, 'Right Face', False, ''),
    (11, 'Left Face', False, ''),
    (12, 'Open Ranks March', True, '5-Second Pause'),
    (13, 'Close Ranks, March', False, ''),
    (14, 'Left Step March', False, ''),
    (15, 'Platoon, Halt', True, '5-Second Pause'),
    (16, 'Left Face', False, ''),
    (17, 'Right Step March', False, ''),
    (18, 'Platoon, Halt', True, '5-Second Pause'),
    (19, 'About Face', False, ''),
    (20, 'Forward, March', False, ''),
    (21, 'Column Right March', False, ''),
    (22, 'Column Right March', False, ''),
    (23, 'Column Right March', False, ''),
    (24, 'Left Flank, March', False, ''),
    (25, 'Right Flank March', False, ''),
    (26, 'Platoon Halt', True, '5-Second Pause'),
    (27, 'Column Left March', False, ''),
    (28, 'Rear March', False, ''),
    (29, 'Rear March', False, ''),
    (30, 'Close Interval March', False, ''),
    (31, 'Forward March', False, ''),
    (32, 'Normal Interval, March', False, ''),
    (33, 'Forward March', False, ''),
    (34, 'Column Left March', False, ''),
    (35, 'Change Step March', False, ''),
    (36, 'Mark Time March', True, '5-Second Pause'),
    (37, 'Platoon Halt', False, ''),
    (38, 'Forward March', False, ''),
    (39, 'Column Left March', False, ''),
    (40, 'Change Step March', False, ''),
    (41, 'Platoon Halt', True, '5-Second Pause'),
    (42, 'Column Left March', False, ''),
    (43, 'Column 1/2 Left March', False, ''),
    (44, 'Column 1/2 Left March', False, ''),
    (45, 'Rear March', False, ''),
    (46, 'Rear March', False, ''),
    (47, 'Platoon Halt', True, '5-Second Pause'),
    (48, 'Forward March', False, ''),
    (49, 'Eyes Right', False, ''),
    (50, 'Ready Front', False, ''),
    (51, 'Column Left march', False, ''),
    (52, 'Half Step March', False, ''),
    (53, 'Forward March', False, ''),
    (54, 'Column Left March', False, ''),
    (55, 'Left Flank March', False, ''),
    (56, 'Right Flank March', False, ''),
    (57, 'Platoon Halt', True, '5-Second Pause'),
    (58, 'Left Face', False, ''),
    (59, 'Report Out', False, 'Verbally report out to Head Judge'),
    (60, 'Depart the Drill Floor', False, 'Depart drill floor in precise military manner'),
]

cg = [
    (1, 'Sling Arms', 10, ''),
    (2, 'Post', 10, ''),
    (3, 'Uncase the Colors', 10, 'Proper sequence: Sling Arms, Post, Uncase, Present/Order, Post'),
    (4, 'Present Arms/Order Arms', 10, ''),
    (5, 'Post', 10, ''),
    (6, 'Report In', 10, 'Report in centered on Head Judge, 6 paces away'),
    (7, 'Colors Reverse March', 10, ''),
    (8, 'Forward, March', 10, ''),
    (9, 'Left Wheel March', 10, ''),
    (10, 'Forward, March', 10, ''),
    (11, 'Colors Reverse March', 10, ''),
    (12, 'Forward, March', 10, ''),
    (13, 'Color Guard Halt', 10, ''),
    (14, 'Mark Time, March (5 Seconds)', 10, 'Hold mark time for 5 seconds'),
    (15, 'COLOR GUARD, HALT', 10, ''),
    (16, 'Order Colors', 10, ''),
    (17, 'Parade Rest', 10, ''),
    (18, 'Colors Guard, Attention', 10, ''),
    (19, 'CARRY COLORS', 10, ''),
    (20, 'Forward March', 10, ''),
    (21, 'Right Wheel March', 10, ''),
    (22, 'Forward, March', 10, ''),
    (23, 'Right Wheel March', 10, ''),
    (24, 'Forward, March', 10, ''),
    (25, 'Colors Reverse March', 10, ''),
    (26, 'Forward, March', 10, ''),
    (27, 'Eyes Right', 10, ''),
    (28, 'Ready Front', 10, ''),
    (29, 'Left Wheel March', 10, ''),
    (30, 'Forward, March', 10, ''),
    (31, 'Left Wheel March', 10, ''),
    (32, 'Forward, March', 10, ''),
    (33, 'Left Wheel March', 10, ''),
    (34, 'Forward, March', 10, ''),
    (35, 'Color Guard, Halt', 10, ''),
    (36, 'Report Out', 10, 'Verbally report out to Head Judge'),
    (37, 'Overall Technical Score', 25, 'Technical execution and alignment (0-25 pts)'),
    (38, 'Overall Precision Score', 25, 'Unison, cadence, and bearing (0-25 pts)'),
]

lines = []
lines.append("import { EventCategory, Division } from '@/types/drill';\n")
lines.append("export interface CriteriaDefinition {")
lines.append("  id: string;")
lines.append("  seqNumber: number;")
lines.append("  category: EventCategory;")
lines.append("  division?: Division;")
lines.append("  name: string;")
lines.append("  description: string;")
lines.append("  maxPoints: number;")
lines.append("  isPauseCommand?: boolean;")
lines.append("}\n")
lines.append("export const DRILL_CRITERIA: CriteriaDefinition[] = [")

for seq, name, pause, desc in armed:
    p_str = 'true' if pause else 'false'
    lines.append(f"  {{\n    id: 'armed_reg_{seq:02d}',\n    seqNumber: {seq},\n    category: 'REGULATION',\n    division: 'ARMED',\n    name: {json.dumps(name)},\n    description: {json.dumps(desc)},\n    maxPoints: 5,\n    isPauseCommand: {p_str},\n  }},")

for seq, name, pause, desc in unarmed:
    p_str = 'true' if pause else 'false'
    lines.append(f"  {{\n    id: 'unarmed_reg_{seq:02d}',\n    seqNumber: {seq},\n    category: 'REGULATION',\n    division: 'UNARMED',\n    name: {json.dumps(name)},\n    description: {json.dumps(desc)},\n    maxPoints: 5,\n    isPauseCommand: {p_str},\n  }},")

for seq, name, max_pts, desc in cg:
    p_str = 'true' if '5 Second' in name else 'false'
    lines.append(f"  {{\n    id: 'cg_{seq:02d}',\n    seqNumber: {seq},\n    category: 'COLOR_GUARD',\n    name: {json.dumps(name)},\n    description: {json.dumps(desc)},\n    maxPoints: {max_pts},\n    isPauseCommand: {p_str},\n  }},")

# Exhibition Placeholders
exh_items = [
    (1, 'Originality & Showmanship', 'Creative choreography, dynamic sequences, unique squad formations', 10),
    (2, 'Precision & Uniformity', 'Pinpoint coordination, uniform angles, instantaneous stops, and unison clicks', 10),
    (3, 'Movement Complexity & Difficulty', 'High-risk exchanges, rapid direction reversals, intricate sequential ripples', 10),
    (4, 'Military Bearing & Flavor', 'Routines adhere to military dignity without inappropriate street or dance elements', 10),
    (5, 'Cadence Variation & Step Dynamics', 'Mastery of slow-time, quick-time, double-time, and silent footwork', 10),
    (6, 'Rifle Spins & Toss Sharpness (Armed)', 'Clean handoffs, spinning velocity, overhead tosses, and flawless recovery', 10),
    (7, 'Floor Coverage & Boundary Control', 'Utilizing all drill pad sectors effectively without boundary line violations', 10),
    (8, 'Report In & Report Out Execution', 'Crisp military salute and report formulation at start and finish within time window', 10),
]

for seq, name, desc, pts in exh_items:
    div = "'ARMED'" if 'Armed' in name else 'undefined'
    lines.append(f"  {{\n    id: 'exh_{seq:02d}',\n    seqNumber: {seq},\n    category: 'EXHIBITION',\n    division: {div},\n    name: {json.dumps(name)},\n    description: {json.dumps(desc)},\n    maxPoints: {pts},\n    isPauseCommand: false,\n  }},")

lines.append("];\n")
lines.append("export function getCriteriaForEvent(category: EventCategory, division?: Division): CriteriaDefinition[] {")
lines.append("  return DRILL_CRITERIA.filter((c) => {")
lines.append("    if (c.category !== category) return false;")
lines.append("    if (c.division && division && c.division !== division) return false;")
lines.append("    return true;")
lines.append("  });")
lines.append("}\n")

with open('/Users/charliecochran/Documents/Drill Scoring/src/lib/drill-sop/criteria.ts', 'w') as f:
    f.write('\n'.join(lines))

print('Criteria updated!')
