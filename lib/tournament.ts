import { createClient } from "@/utils/supabase/client";

export type TournamentType = "americano" | "mexicano";

export interface PlayerInput {
  name: string;
  email?: string;
  userId?: string;
  avatarUrl?: string;
}

export interface TournamentData {
  tournamentType: TournamentType;
  targetPoints: number;
  players: PlayerInput[];
}

/**
 * Creates a tournament with initial match (Round 1) using RPC function
 */
export async function createTournament(data: TournamentData, userId: string) {
  const supabase = createClient();

  try {
    const tournamentName = `${data.tournamentType.charAt(0).toUpperCase() + data.tournamentType.slice(1)} - ${new Date().toLocaleDateString()}`;

    // Prepare player data with names, emails, user_ids, and avatar_urls
    const playerNames = data.players.map(p => p.name);
    const playerEmails = data.players.map(p => p.email || null);
    const playerUserIds = data.players.map(p => p.userId || null);
    const playerAvatarUrls = data.players.map(p => p.avatarUrl || null);

    // Call RPC function to create tournament, add players, and generate first match
    const { data: result, error } = await supabase.rpc(
      "create_tournament_with_players",
      {
        p_name: tournamentName,
        p_tournament_type: data.tournamentType,
        p_target_points: data.targetPoints,
        p_created_by: userId,
        p_player_names: playerNames,
        p_player_emails: playerEmails,
        p_player_user_ids: playerUserIds,
        p_player_avatar_urls: playerAvatarUrls,
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
