import { createClient } from "@/utils/supabase/client";

export type TournamentType = "americano" | "mexicano";

export interface TournamentData {
  tournamentType: TournamentType;
  targetPoints: number;
  players: string[];
}

/**
 * Creates a tournament with initial match (Round 1) using RPC function
 */
export async function createTournament(data: TournamentData, userId: string) {
  const supabase = createClient();

  try {
    const tournamentName = `${data.tournamentType.charAt(0).toUpperCase() + data.tournamentType.slice(1)} - ${new Date().toLocaleDateString()}`;

    // Call RPC function to create tournament, add players, and generate first match
    const { data: result, error } = await supabase.rpc(
      "create_tournament_with_players",
      {
        p_name: tournamentName,
        p_tournament_type: data.tournamentType,
        p_target_points: data.targetPoints,
        p_created_by: userId,
        p_player_names: data.players,
      }
    );

    if (error) throw error;

    console.log("✅ Tournament created:", result);

    return {
      success: true,
      tournamentId: result.tournament_id,
      matchId: result.match_id,
    };
  } catch (error) {
    console.error("❌ Error creating tournament:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
