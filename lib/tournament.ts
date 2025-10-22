import { createClient } from "@/utils/supabase/client";

export type TournamentType = "americano" | "mexicano";

export interface TournamentData {
  tournamentType: TournamentType;
  targetPoints: number;
  players: string[];
}

export interface TournamentPlayer {
  id: string;
  player_name: string;
  player_order: number;
}

/**
 * Creates a tournament with initial match (Round 1)
 */
export async function createTournament(data: TournamentData, userId: string) {
  const supabase = createClient();

  try {
    // Step 1: Create tournament
    const tournamentName = `${data.tournamentType.charAt(0).toUpperCase() + data.tournamentType.slice(1)} - ${new Date().toLocaleDateString()}`;

    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: tournamentName,
        tournament_type: data.tournamentType,
        target_points: data.targetPoints,
        status: "active",
        current_round: 1,
        created_by: userId,
      })
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    console.log("✅ Tournament created:", tournament);

    // Step 2: Insert all players
    const playersToInsert = data.players.map((name, index) => ({
      tournament_id: tournament.id,
      player_name: name,
      player_order: index + 1,
      total_points: 0,
      matches_played: 0,
      matches_won: 0,
    }));

    const { data: insertedPlayers, error: playersError } = await supabase
      .from("tournament_players")
      .insert(playersToInsert)
      .select("id, player_name, player_order");

    if (playersError) throw playersError;

    console.log("✅ Players inserted:", insertedPlayers);

    // Step 3: Generate Round 1 match
    const round1Match = await generateFirstMatch(
      tournament.id,
      insertedPlayers as TournamentPlayer[]
    );

    console.log("✅ Round 1 match created:", round1Match);

    return {
      success: true,
      tournament,
      players: insertedPlayers,
      firstMatch: round1Match,
    };
  } catch (error) {
    console.error("❌ Error creating tournament:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generates the first match (Round 1) for a tournament
 * For both Americano and Mexicano, Round 1 is random
 */
async function generateFirstMatch(
  tournamentId: string,
  players: TournamentPlayer[]
) {
  const supabase = createClient();

  // Shuffle players for random first match
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Take first 4 players
  const matchPlayers = shuffled.slice(0, 4);

  // Team A: First 2 players
  // Team B: Next 2 players
  const [p1, p2, p3, p4] = matchPlayers;

  // Insert the match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      tournament_id: tournamentId,
      round_number: 1,
      team_a_player1_id: p1.id,
      team_a_player2_id: p2.id,
      team_b_player1_id: p3.id,
      team_b_player2_id: p4.id,
      status: "pending",
    })
    .select()
    .single();

  if (matchError) throw matchError;

  // Track pairings for this match
  await trackMatchPairings(tournamentId, [p1.id, p2.id, p3.id, p4.id]);

  return match;
}

/**
 * Tracks player pairings (teammates and opponents) for a match
 */
async function trackMatchPairings(
  tournamentId: string,
  playerIds: string[]
) {
  const supabase = createClient();

  const [p1, p2, p3, p4] = playerIds;

  // Prepare pairing records
  const pairings = [
    // Team A partnerships (teammates)
    {
      tournament_id: tournamentId,
      player1_id: p1 < p2 ? p1 : p2,
      player2_id: p1 < p2 ? p2 : p1,
      paired_as_teammates: 1,
      paired_as_opponents: 0,
    },
    // Team B partnerships (teammates)
    {
      tournament_id: tournamentId,
      player1_id: p3 < p4 ? p3 : p4,
      player2_id: p3 < p4 ? p4 : p3,
      paired_as_teammates: 1,
      paired_as_opponents: 0,
    },
    // Team A vs Team B (opponents)
    ...getOpponentPairs([p1, p2], [p3, p4], tournamentId),
  ];

  // Upsert pairings (increment if exists)
  for (const pairing of pairings) {
    const { error } = await supabase.from("player_pairings").upsert(
      pairing,
      {
        onConflict: "tournament_id,player1_id,player2_id",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error("Error tracking pairing:", error);
    }
  }
}

/**
 * Helper to generate opponent pairing records
 */
function getOpponentPairs(
  teamA: string[],
  teamB: string[],
  tournamentId: string
) {
  const pairs = [];

  for (const a of teamA) {
    for (const b of teamB) {
      pairs.push({
        tournament_id: tournamentId,
        player1_id: a < b ? a : b,
        player2_id: a < b ? b : a,
        paired_as_teammates: 0,
        paired_as_opponents: 1,
      });
    }
  }

  return pairs;
}
