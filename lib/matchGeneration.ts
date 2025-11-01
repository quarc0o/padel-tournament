import { createClient } from "@/utils/supabase/client";

/**
 * Completes a match with scores and generates the next match using RPC function
 * Returns result indicating if tournament is complete
 */
export async function completeMatchAndGenerateNext(
  matchId: string,
  teamAScore: number,
  teamBScore: number
) {
  const supabase = createClient();

  try {
    const { data: result, error } = await supabase.rpc(
      "complete_match_and_generate_next",
      {
        p_match_id: matchId,
        p_team_a_score: teamAScore,
        p_team_b_score: teamBScore,
      }
    );

    if (error) throw error;

    console.log("✅ Match completed:", result);

    return {
      success: true,
      tournamentComplete: result.next_match?.tournament_complete || false,
      nextMatchId: result.next_match?.match_id,
      nextRound: result.next_match?.round_number,
    };
  } catch (error) {
    console.error("❌ Error completing match:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
