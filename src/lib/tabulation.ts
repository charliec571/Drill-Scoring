import {
  Division,
  EventCategory,
  Scorecard,
  PenaltyRecord,
  FinalResult,
  OverallChampionshipStanding,
  Team,
  School,
  Judge,
} from '@/types/drill';

export interface TabulationInput {
  teams: Team[];
  schools: School[];
  judges: Judge[];
  scorecards: Scorecard[];
  penalties: PenaltyRecord[];
}

export interface TabulationOutput {
  eventResults: Record<string, FinalResult[]>; // event_id -> sorted FinalResult[]
  overallStandings: Record<Division, OverallChampionshipStanding[]>;
}

/**
 * Tabulates event scores and applies official SOP Paragraph 5 tie-breaking rules.
 * Fully compatible with Supabase trigger recalculate_event_results() and final_event_results.
 */
export function tabulateTournamentResults(input: TabulationInput): TabulationOutput {
  const { teams, schools, judges, scorecards, penalties } = input;

  const schoolMap = new Map(schools.map((s) => [s.id, s]));
  const judgeMap = new Map(judges.map((j) => [j.id, j]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Find all inspection scorecards per team to look up Head Judge Knowledge & Uniform scores
  const teamInspectionScores = new Map<
    string,
    { headJudgeKnowledge?: number; headJudgeUniform?: number }
  >();

  // Map to group scorecards by team_id and event_id
  const teamEventScores = new Map<string, Scorecard[]>();
  for (const sc of scorecards) {
    if (sc.status === 'DRAFT') continue; // only tabulate submitted/verified scorecards

    const key = `${sc.team_id}_${sc.event_id}`;
    if (!teamEventScores.has(key)) {
      teamEventScores.set(key, []);
    }
    teamEventScores.get(key)!.push(sc);

    const judge = judgeMap.get(sc.judge_id);
    const isHead = sc.is_head_judge ?? (judge?.judge_number === 1);

    if (isHead) {
      if (sc.overall_knowledge_score !== undefined || sc.uniform_appearance_score !== undefined) {
        teamInspectionScores.set(sc.team_id, {
          headJudgeKnowledge: sc.overall_knowledge_score,
          headJudgeUniform: sc.uniform_appearance_score,
        });
      }
    }
  }

  // Group penalties by team_id and event_id
  const teamEventPenalties = new Map<string, PenaltyRecord>();
  for (const p of penalties) {
    const key = `${p.team_id}_${p.event_id}`;
    teamEventPenalties.set(key, p);
  }

  // Group results by event_id
  const eventsMap = new Map<string, FinalResult[]>();

  // Iterate over each distinct team + event pair that has scorecards
  for (const [key, cards] of Array.from(teamEventScores.entries())) {
    const [teamId, eventId] = key.split('_');
    const team = teamMap.get(teamId);
    if (!team) continue;
    const school = schoolMap.get(team.school_id);

    // Sum raw scores from all judges
    let totalRaw = 0;
    let hjRaw = 0;
    let j2Raw = 0;
    let hjKnow = 0;
    let hjUnif = 0;

    const judgeRawScores = cards.map((c) => {
      const judge = judgeMap.get(c.judge_id);
      const isHead = c.is_head_judge ?? (judge?.judge_number === 1);
      const isJ2 = judge?.judge_number === 2;
      const scoreVal = Number(c.raw_score || 0);

      totalRaw += scoreVal;
      if (isHead) {
        hjRaw = scoreVal;
        hjKnow = Number(c.overall_knowledge_score || 0);
        hjUnif = Number(c.uniform_appearance_score || 0);
      } else if (isJ2) {
        j2Raw = scoreVal;
      }

      return {
        judge_id: c.judge_id,
        judge_name: judge ? judge.full_name : 'Judge',
        judge_number: judge?.judge_number,
        is_head_judge: isHead,
        raw_score: scoreVal,
        overall_knowledge: c.overall_knowledge_score,
        uniform_appearance: c.uniform_appearance_score,
      };
    });

    const penaltyRecord = teamEventPenalties.get(key);
    const totalPenalties = penaltyRecord ? Number(penaltyRecord.total_penalty_deduction || 0) : 0;
    const finalScore = Math.max(0, totalRaw - totalPenalties);

    const result: FinalResult = {
      id: `${teamId}_${eventId}`,
      team_id: teamId,
      team_name: `${school?.name || 'Team'} (${team.division})`,
      school_name: school?.name || 'Unknown School',
      brigade: school?.brigade || 'Brigade',
      division: team.division,
      event_id: eventId,
      event_category: 'REGULATION',
      judge_raw_scores: judgeRawScores,
      total_raw_score: Number(totalRaw.toFixed(2)),
      total_penalties: Number(totalPenalties.toFixed(2)),
      final_score: Number(finalScore.toFixed(2)),
      head_judge_raw_score: Number(hjRaw.toFixed(2)),
      judge_2_raw_score: Number(j2Raw.toFixed(2)),
      hj_knowledge_score: Number(hjKnow.toFixed(2)),
      hj_uniform_score: Number(hjUnif.toFixed(2)),
      event_rank: 0,
      tie_broken: false,
      tie_break_reason: undefined,
      updated_at: new Date().toISOString(),
    };

    if (!eventsMap.has(eventId)) {
      eventsMap.set(eventId, []);
    }
    eventsMap.get(eventId)!.push(result);
  }

  // Sort and apply SOP Paragraph 5 Event Tie Breakers
  const tabulatedEventResults: Record<string, FinalResult[]> = {};

  for (const [eventId, results] of Array.from(eventsMap.entries())) {
    results.sort((a, b) => {
      // Primary: Final Score
      if (b.final_score !== a.final_score) {
        return b.final_score - a.final_score;
      }

      // TIE DETECTED -> Level 1: Head Judge Raw Score
      const aHJ = a.head_judge_raw_score ?? a.judge_raw_scores.find((j) => j.is_head_judge)?.raw_score ?? 0;
      const bHJ = b.head_judge_raw_score ?? b.judge_raw_scores.find((j) => j.is_head_judge)?.raw_score ?? 0;
      if (bHJ !== aHJ) {
        return bHJ - aHJ;
      }

      // Level 2: Judge #2 Raw Score
      const aJ2 = a.judge_2_raw_score ?? a.judge_raw_scores.find((j) => j.judge_number === 2 || !j.is_head_judge)?.raw_score ?? 0;
      const bJ2 = b.judge_2_raw_score ?? b.judge_raw_scores.find((j) => j.judge_number === 2 || !j.is_head_judge)?.raw_score ?? 0;
      if (bJ2 !== aJ2) {
        return bJ2 - aJ2;
      }

      // Level 3: Head Judge Overall Knowledge (Unit Inspection)
      const aInsp = teamInspectionScores.get(a.team_id);
      const bInsp = teamInspectionScores.get(b.team_id);
      const aKnowledge = aInsp?.headJudgeKnowledge ?? a.hj_knowledge_score ?? 0;
      const bKnowledge = bInsp?.headJudgeKnowledge ?? b.hj_knowledge_score ?? 0;
      if (bKnowledge !== aKnowledge) {
        return bKnowledge - aKnowledge;
      }

      // Level 4: Head Judge Uniform Preparation & Appearance (Unit Inspection)
      const aUniform = aInsp?.headJudgeUniform ?? a.hj_uniform_score ?? 0;
      const bUniform = bInsp?.headJudgeUniform ?? b.hj_uniform_score ?? 0;
      if (bUniform !== aUniform) {
        return bUniform - aUniform;
      }

      return 0; // Tied
    });

    // Assign event_rank and annotate tie break reasons
    for (let i = 0; i < results.length; i++) {
      results[i].event_rank = i + 1;

      const prev = results[i - 1];
      const next = results[i + 1];
      const hadTieScore = (prev && prev.final_score === results[i].final_score) ||
                          (next && next.final_score === results[i].final_score);

      if (hadTieScore) {
        const other = (prev && prev.final_score === results[i].final_score) ? prev : next;
        const myHJ = results[i].head_judge_raw_score ?? results[i].judge_raw_scores.find((j) => j.is_head_judge)?.raw_score ?? 0;
        const otherHJ = other.head_judge_raw_score ?? other.judge_raw_scores.find((j) => j.is_head_judge)?.raw_score ?? 0;

        if (myHJ !== otherHJ) {
          results[i].tie_broken = true;
          results[i].tie_break_reason = `SOP Para 5 Rule 1: Head Judge Raw Score (${myHJ} vs ${otherHJ})`;
        } else {
          const myJ2 = results[i].judge_2_raw_score ?? results[i].judge_raw_scores.find((j) => j.judge_number === 2 || !j.is_head_judge)?.raw_score ?? 0;
          const otherJ2 = other.judge_2_raw_score ?? other.judge_raw_scores.find((j) => j.judge_number === 2 || !j.is_head_judge)?.raw_score ?? 0;
          if (myJ2 !== otherJ2) {
            results[i].tie_broken = true;
            results[i].tie_break_reason = `SOP Para 5 Rule 2: Judge #2 Raw Score (${myJ2} vs ${otherJ2})`;
          } else {
            const myInsp = teamInspectionScores.get(results[i].team_id);
            const otherInsp = teamInspectionScores.get(other.team_id);
            const myK = myInsp?.headJudgeKnowledge ?? results[i].hj_knowledge_score ?? 0;
            const otherK = otherInsp?.headJudgeKnowledge ?? other.hj_knowledge_score ?? 0;
            if (myK !== otherK) {
              results[i].tie_broken = true;
              results[i].tie_break_reason = `SOP Para 5 Rule 3: Inspection Knowledge Score (${myK} vs ${otherK})`;
            } else {
              const myU = myInsp?.headJudgeUniform ?? results[i].hj_uniform_score ?? 0;
              const otherU = otherInsp?.headJudgeUniform ?? other.hj_uniform_score ?? 0;
              if (myU !== otherU) {
                results[i].tie_broken = true;
                results[i].tie_break_reason = `SOP Para 5 Rule 4: Inspection Uniform Score (${myU} vs ${otherU})`;
              } else {
                results[i].tie_broken = false;
                results[i].tie_break_reason = 'Unresolved tie (Identical scores across all 4 SOP tie-breakers)';
              }
            }
          }
        }
      }
    }

    tabulatedEventResults[eventId] = results;
  }

  // ========================================================
  // OVERALL CHAMPIONSHIP TABULATION (Per Division)
  // SOP Paragraph 5:
  // 1. Highest number of 1st place finishes
  // 2. Highest number of 2nd place finishes
  // 3. Highest number of 3rd place finishes
  // ========================================================
  const overallStandings: Record<Division, OverallChampionshipStanding[]> = {
    ARMED: [],
    UNARMED: [],
  };

  const divisionTeams = {
    ARMED: teams.filter((t) => t.division === 'ARMED'),
    UNARMED: teams.filter((t) => t.division === 'UNARMED'),
  };

  for (const div of ['ARMED', 'UNARMED'] as Division[]) {
    const list = divisionTeams[div];
    const standings: OverallChampionshipStanding[] = list.map((team) => {
      const school = schoolMap.get(team.school_id);
      let totalScore = 0;
      let firstCount = 0;
      let secondCount = 0;
      let thirdCount = 0;
      const eventFinishes: OverallChampionshipStanding['event_finishes'] = {};

      for (const resList of Object.values(tabulatedEventResults)) {
        const teamRes = resList.find((r) => r.team_id === team.id);
        if (teamRes) {
          totalScore += teamRes.final_score;
          if (teamRes.event_rank === 1) firstCount++;
          if (teamRes.event_rank === 2) secondCount++;
          if (teamRes.event_rank === 3) thirdCount++;

          eventFinishes[teamRes.event_category] = {
            rank: teamRes.event_rank,
            final_score: teamRes.final_score,
            raw_score: teamRes.total_raw_score,
            penalties: teamRes.total_penalties,
          };
        }
      }

      return {
        team_id: team.id,
        school_name: school?.name || 'Unknown School',
        brigade: school?.brigade || 'Brigade',
        division: div,
        commander_name: team.commander_name,
        total_championship_score: Number(totalScore.toFixed(2)),
        event_finishes: eventFinishes,
        first_place_count: firstCount,
        second_place_count: secondCount,
        third_place_count: thirdCount,
        overall_rank: 0,
        tie_broken: false,
        tie_break_reason: undefined,
      };
    });

    standings.sort((a, b) => {
      if (b.total_championship_score !== a.total_championship_score) {
        return b.total_championship_score - a.total_championship_score;
      }
      if (b.first_place_count !== a.first_place_count) {
        return b.first_place_count - a.first_place_count;
      }
      if (b.second_place_count !== a.second_place_count) {
        return b.second_place_count - a.second_place_count;
      }
      if (b.third_place_count !== a.third_place_count) {
        return b.third_place_count - a.third_place_count;
      }
      return 0;
    });

    for (let i = 0; i < standings.length; i++) {
      standings[i].overall_rank = i + 1;
      const prev = standings[i - 1];
      const next = standings[i + 1];
      const hadScoreTie = (prev && prev.total_championship_score === standings[i].total_championship_score) ||
                          (next && next.total_championship_score === standings[i].total_championship_score);

      if (hadScoreTie) {
        const other = (prev && prev.total_championship_score === standings[i].total_championship_score) ? prev : next;
        if (standings[i].first_place_count !== other.first_place_count) {
          standings[i].tie_broken = true;
          standings[i].tie_break_reason = `SOP Championship Rule 1: 1st Place Finishes (${standings[i].first_place_count} vs ${other.first_place_count})`;
        } else if (standings[i].second_place_count !== other.second_place_count) {
          standings[i].tie_broken = true;
          standings[i].tie_break_reason = `SOP Championship Rule 2: 2nd Place Finishes (${standings[i].second_place_count} vs ${other.second_place_count})`;
        } else if (standings[i].third_place_count !== other.third_place_count) {
          standings[i].tie_broken = true;
          standings[i].tie_break_reason = `SOP Championship Rule 3: 3rd Place Finishes (${standings[i].third_place_count} vs ${other.third_place_count})`;
        } else {
          standings[i].tie_broken = false;
          standings[i].tie_break_reason = 'Co-Champions (Identical scores and finish counts)';
        }
      }
    }

    overallStandings[div] = standings;
  }

  return {
    eventResults: tabulatedEventResults,
    overallStandings,
  };
}
