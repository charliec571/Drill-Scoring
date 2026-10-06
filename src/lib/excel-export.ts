import ExcelJS from 'exceljs';
import { TabulationOutput } from '@/lib/tabulation';
import {
  School,
  Team,
  Judge,
  DrillEvent,
  Scorecard,
  PenaltyRecord,
} from '@/types/drill';

export interface ExcelExportData {
  tabulation: TabulationOutput;
  schools: School[];
  teams: Team[];
  judges: Judge[];
  events: DrillEvent[];
  scorecards: Scorecard[];
  penalties: PenaltyRecord[];
}

export async function generateDrillChampionshipWorkbook(data: ExcelExportData): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Concordia High School JROTC Annual Clendenen HQ';
  workbook.created = new Date();

  const primaryHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF111418' }, // Dark Tactical
  };

  const armyGoldFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC72C' }, // Army Gold
  };

  const secondaryHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4B5320' }, // Army Green
  };

  const headerFontWhite: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const headerFontBlack: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FF111418' },
  };

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: 'FFFFC72C' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
  };

  // ========================================================
  // SHEET 1: OVERALL DIVISION RESULTS
  // ========================================================
  const sheet1 = workbook.addWorksheet('Overall Division Results', {
    views: [{ showGridLines: true }],
  });

  sheet1.mergeCells('A1:I1');
  sheet1.getCell('A1').value = 'CONCORDIA HIGH SCHOOL JROTC ANNUAL CLENDENEN - MARCH 6, 2027 - OVERALL RESULTS';
  sheet1.getCell('A1').font = titleFont;
  sheet1.getCell('A1').fill = primaryHeaderFill;
  sheet1.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet1.getRow(1).height = 36;

  sheet1.mergeCells('A2:I2');
  sheet1.getCell('A2').value = 'Official Results — Concordia High School JROTC Annual Clendenen — March 6, 2027';
  sheet1.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FFFFFFFF' } };
  sheet1.getCell('A2').fill = primaryHeaderFill;
  sheet1.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

  let rowIdx1 = 4;

  for (const div of ['ARMED', 'UNARMED'] as const) {
    sheet1.mergeCells(`A${rowIdx1}:I${rowIdx1}`);
    const divHeader = sheet1.getCell(`A${rowIdx1}`);
    divHeader.value = `${div} DIVISION CHAMPIONSHIP STANDINGS`;
    divHeader.font = headerFontBlack;
    divHeader.fill = armyGoldFill;
    divHeader.alignment = { vertical: 'middle' };
    sheet1.getRow(rowIdx1).height = 24;
    rowIdx1++;

    // Table Headers
    const headers = [
      'Rank',
      'School Name',
      'Brigade',
      'Commander',
      'Total Points',
      '1st Place Events',
      '2nd Place Events',
      '3rd Place Events',
      'Tie Breaker Notes',
    ];
    const headerRow = sheet1.getRow(rowIdx1);
    headerRow.values = headers;
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = secondaryHeaderFill;
      cell.font = headerFontWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });
    rowIdx1++;

    const standings = data.tabulation.overallStandings[div] || [];
    for (const st of standings) {
      const dataRow = sheet1.getRow(rowIdx1);
      dataRow.values = [
        st.overall_rank === 1 ? '1st (Champion)' : st.overall_rank === 2 ? '2nd Place' : st.overall_rank === 3 ? '3rd Place' : `${st.overall_rank}th`,
        st.school_name,
        st.brigade,
        st.commander_name,
        st.total_championship_score,
        st.first_place_count,
        st.second_place_count,
        st.third_place_count,
        st.tie_break_reason || (st.tie_broken ? 'Tie broken per SOP' : 'None'),
      ];
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 || colNumber >= 5 && colNumber <= 8 ? 'center' : 'left',
        };
        if (st.overall_rank === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF9E6' },
          };
        }
      });
      rowIdx1++;
    }
    rowIdx1 += 2;
  }

  sheet1.columns = [
    { width: 16 },
    { width: 34 },
    { width: 16 },
    { width: 24 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 44 },
  ];

  // ========================================================
  // SHEET 2: EVENT STANDINGS
  // ========================================================
  const sheet2 = workbook.addWorksheet('Event Standings', {
    views: [{ showGridLines: true }],
  });

  sheet2.mergeCells('A1:I1');
  sheet2.getCell('A1').value = 'EVENT BY EVENT STANDINGS & PLACEMENT';
  sheet2.getCell('A1').font = titleFont;
  sheet2.getCell('A1').fill = primaryHeaderFill;
  sheet2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet2.getRow(1).height = 36;

  let rowIdx2 = 3;

  for (const [eventId, results] of Object.entries(data.tabulation.eventResults)) {
    const event = data.events.find((e) => e.id === eventId);
    const eventTitle = event ? `${event.division} - ${event.name}` : `Event ${eventId}`;

    sheet2.mergeCells(`A${rowIdx2}:I${rowIdx2}`);
    const secCell = sheet2.getCell(`A${rowIdx2}`);
    secCell.value = eventTitle;
    secCell.font = headerFontBlack;
    secCell.fill = armyGoldFill;
    sheet2.getRow(rowIdx2).height = 24;
    rowIdx2++;

    const headers = [
      'Rank',
      'School Name',
      'Brigade',
      'Judge 1 (HJ)',
      'Judge 2',
      'Total Raw Score',
      'Total Deductions',
      'Final Score',
      'Tie Breaker Explanation',
    ];
    const headerRow = sheet2.getRow(rowIdx2);
    headerRow.values = headers;
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = secondaryHeaderFill;
      cell.font = headerFontWhite;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });
    rowIdx2++;

    for (const res of results) {
      const hjScore = res.judge_raw_scores.find((j) => j.is_head_judge)?.raw_score ?? '-';
      const j2Score = res.judge_raw_scores.filter((j) => !j.is_head_judge)[0]?.raw_score ?? '-';

      const dataRow = sheet2.getRow(rowIdx2);
      dataRow.values = [
        res.event_rank === 1 ? '1st Place' : res.event_rank === 2 ? '2nd Place' : res.event_rank === 3 ? '3rd Place' : `${res.event_rank}th`,
        res.school_name,
        res.brigade,
        hjScore,
        j2Score,
        res.total_raw_score,
        res.total_penalties,
        res.final_score,
        res.tie_break_reason || 'Standard placement',
      ];
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.border = thinBorder;
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 || (colNumber >= 4 && colNumber <= 8) ? 'center' : 'left',
        };
        if (res.event_rank === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF9E6' },
          };
        }
      });
      rowIdx2++;
    }
    rowIdx2 += 2;
  }

  sheet2.columns = [
    { width: 14 },
    { width: 34 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
    { width: 44 },
  ];

  // ========================================================
  // SHEET 3: DETAILED SCORE MATRIX
  // ========================================================
  const sheet3 = workbook.addWorksheet('Detailed Score Matrix', {
    views: [{ showGridLines: true }],
  });

  sheet3.mergeCells('A1:J1');
  sheet3.getCell('A1').value = 'DETAILED SCORE MATRIX PER JUDGE & SUB-CRITERIA';
  sheet3.getCell('A1').font = titleFont;
  sheet3.getCell('A1').fill = primaryHeaderFill;
  sheet3.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet3.getRow(1).height = 36;

  const matrixHeaders = [
    'Scorecard ID',
    'Event',
    'School / Team',
    'Judge Name',
    'Role',
    'Raw Score',
    'HJ Knowledge Score',
    'HJ Uniform Score',
    'Status',
    'Submitted At',
  ];

  const mHeaderRow = sheet3.getRow(3);
  mHeaderRow.values = matrixHeaders;
  mHeaderRow.height = 24;
  mHeaderRow.eachCell((cell) => {
    cell.fill = secondaryHeaderFill;
    cell.font = headerFontWhite;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  let rowIdx3 = 4;
  const schoolMap = new Map(data.schools.map((s) => [s.id, s]));
  const teamMap = new Map(data.teams.map((t) => [t.id, t]));
  const judgeMap = new Map(data.judges.map((j) => [j.id, j]));
  const eventMap = new Map(data.events.map((e) => [e.id, e]));

  for (const sc of data.scorecards) {
    const team = teamMap.get(sc.team_id);
    const school = team ? schoolMap.get(team.school_id) : null;
    const judge = judgeMap.get(sc.judge_id);
    const event = eventMap.get(sc.event_id);

    const row = sheet3.getRow(rowIdx3);
    row.values = [
      sc.id.substring(0, 8),
      event ? `${event.division} ${event.category}` : sc.event_id,
      school ? `${school.name} (${team?.division})` : sc.team_id,
      judge ? judge.full_name : 'Unknown Judge',
      sc.is_head_judge ? 'HEAD JUDGE' : 'Judge',
      sc.raw_score,
      sc.overall_knowledge_score !== undefined ? sc.overall_knowledge_score : 'N/A',
      sc.uniform_appearance_score !== undefined ? sc.uniform_appearance_score : 'N/A',
      sc.status,
      sc.submitted_at ? new Date(sc.submitted_at).toLocaleTimeString() : 'Draft',
    ];
    row.height = 19;
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber >= 6 && colNumber <= 9 ? 'center' : 'left',
      };
    });
    rowIdx3++;
  }

  sheet3.columns = [
    { width: 14 },
    { width: 26 },
    { width: 34 },
    { width: 24 },
    { width: 16 },
    { width: 14 },
    { width: 22 },
    { width: 20 },
    { width: 16 },
    { width: 18 },
  ];

  // ========================================================
  // SHEET 4: PENALTY AUDIT LOG
  // ========================================================
  const sheet4 = workbook.addWorksheet('Penalty Audit Log', {
    views: [{ showGridLines: true }],
  });

  sheet4.mergeCells('A1:I1');
  sheet4.getCell('A1').value = 'OFFICIAL PENALTY DEDUCTION AUDIT LOG';
  sheet4.getCell('A1').font = titleFont;
  sheet4.getCell('A1').fill = primaryHeaderFill;
  sheet4.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet4.getRow(1).height = 36;

  const penHeaders = [
    'School / Team',
    'Event',
    'Missing Cadets (-25 ea)',
    'Pause Violations (-5 ea)',
    'Boundary Violations (-10 ea)',
    'Time Violations (-1/s)',
    'Total Deductions',
    'Judge Notes & Reasons',
  ];

  const pHeaderRow = sheet4.getRow(3);
  pHeaderRow.values = penHeaders;
  pHeaderRow.height = 24;
  pHeaderRow.eachCell((cell) => {
    cell.fill = armyGoldFill;
    cell.font = headerFontBlack;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  let rowIdx4 = 4;
  for (const pen of data.penalties) {
    const team = teamMap.get(pen.team_id);
    const school = team ? schoolMap.get(team.school_id) : null;
    const event = eventMap.get(pen.event_id);

    const row = sheet4.getRow(rowIdx4);
    row.values = [
      school ? `${school.name} (${team?.division})` : pen.team_id,
      event ? `${event.division} ${event.category}` : pen.event_id,
      pen.missing_cadet_count ? `${pen.missing_cadet_count} (-${pen.missing_cadet_count * 25} pts)` : '0',
      pen.pause_violation_count ? `${pen.pause_violation_count} (-${pen.pause_violation_count * 5} pts)` : '0',
      pen.boundary_violations ? `${pen.boundary_violations} (-${pen.boundary_violations * 10} pts)` : '0',
      pen.time_under_over_seconds ? `${pen.time_under_over_seconds}s (-${pen.time_under_over_seconds} pts)` : '0',
      `-${pen.total_penalty_deduction} pts`,
      pen.notes || 'None',
    ];
    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber >= 3 && colNumber <= 8 ? 'center' : 'left',
      };
      if (colNumber === 8 && pen.total_penalty_deduction > 0) {
        cell.font = { color: { argb: 'FFCC0000' }, bold: true };
      }
    });
    rowIdx4++;
  }

  sheet4.columns = [
    { width: 34 },
    { width: 26 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 44 },
  ];

  return workbook;
}

/**
 * Generates and triggers a browser download of the multi-sheet Excel file.
 */
export async function downloadChampionshipExcel(data: ExcelExportData, filename?: string): Promise<void> {
  const workbook = await generateDrillChampionshipWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `Concordia_JROTC_Annual_Clendenen_2027_Results.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
