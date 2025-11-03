"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { completeMatchAndGenerateNext } from "@/lib/matchGeneration";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
type Player = Database["public"]["Tables"]["tournament_players"]["Row"];
type Match = Database["public"]["Tables"]["matches"]["Row"];

interface MatchWithPlayers extends Match {
  team_a_player1: Player;
  team_a_player2: Player;
  team_b_player1: Player;
  team_b_player2: Player;
}

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<MatchWithPlayers | null>(
    null
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamAScore, setTeamAScore] = useState<number | "">("");
  const [teamBScore, setTeamBScore] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [tournamentId]);

  async function fetchTournamentData() {
    const supabase = createClient();

    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch all players
      const { data: playersData, error: playersError } = await supabase
        .from("tournament_players")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("total_points", { ascending: false });

      if (playersError) throw playersError;
      setPlayers(playersData);

      // Fetch completed matches
      const { data: completedMatchesData, error: completedMatchesError } =
        await supabase
          .from("matches")
          .select("*")
          .eq("tournament_id", tournamentId)
          .eq("status", "completed")
          .order("round_number", { ascending: true });

      if (completedMatchesError) throw completedMatchesError;
      setCompletedMatches(completedMatchesData || []);

      // Fetch current match (round = current_round)
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("round_number", tournamentData.current_round)
        .single();

      if (matchError) {
        if (matchError.code === "PGRST116") {
          // No match found - tournament might be complete
          console.log("No current match found");
        } else {
          throw matchError;
        }
      } else {
        // Fetch player details for the match
        const playerIds = [
          matchData.team_a_player1_id,
          matchData.team_a_player2_id,
          matchData.team_b_player1_id,
          matchData.team_b_player2_id,
        ];

        const { data: matchPlayers, error: matchPlayersError } = await supabase
          .from("tournament_players")
          .select("*")
          .in("id", playerIds);

        if (matchPlayersError) throw matchPlayersError;

        // Map players to match
        const matchWithPlayers: MatchWithPlayers = {
          ...matchData,
          team_a_player1: matchPlayers.find(
            (p) => p.id === matchData.team_a_player1_id
          )!,
          team_a_player2: matchPlayers.find(
            (p) => p.id === matchData.team_a_player2_id
          )!,
          team_b_player1: matchPlayers.find(
            (p) => p.id === matchData.team_b_player1_id
          )!,
          team_b_player2: matchPlayers.find(
            (p) => p.id === matchData.team_b_player2_id
          )!,
        };

        setCurrentMatch(matchWithPlayers);

        // If match already has scores, populate them
        if (matchData.team_a_score !== null) {
          setTeamAScore(matchData.team_a_score);
          setTeamBScore(matchData.team_b_score!);
        }
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      alert("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  }

  const handleTeamAScoreChange = (value: string) => {
    if (!tournament) return;

    if (value === "") {
      setTeamAScore("");
      setTeamBScore("");
      return;
    }

    const score = parseInt(value);
    if (isNaN(score) || score < 0 || score > tournament.target_points) return;

    setTeamAScore(score);
    setTeamBScore(tournament.target_points - score);
  };

  const handleTeamBScoreChange = (value: string) => {
    if (!tournament) return;

    if (value === "") {
      setTeamAScore("");
      setTeamBScore("");
      return;
    }

    const score = parseInt(value);
    if (isNaN(score) || score < 0 || score > tournament.target_points) return;

    setTeamBScore(score);
    setTeamAScore(tournament.target_points - score);
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.player_name || "Unknown";
  };

  const handleSubmitScore = async () => {
    if (
      !currentMatch ||
      !tournament ||
      teamAScore === "" ||
      teamBScore === ""
    ) {
      alert("Please enter a score");
      return;
    }

    setSubmitting(true);

    try {
      // Complete match and generate next using RPC function
      const result = await completeMatchAndGenerateNext(
        currentMatch.id,
        teamAScore as number,
        teamBScore as number
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to complete match");
      }

      if (result.tournamentComplete) {
        console.log("🏆 Tournament Complete!");
        alert("Score saved! Tournament is complete! 🎉");
      } else {
        console.log("✅ Next match generated for Round", result.nextRound);
        alert(`Score saved! Moving to Round ${result.nextRound}...`);
      }

      // Reload the page to show the new match or final standings
      window.location.reload();
    } catch (error) {
      console.error("Error saving score:", error);
      alert("Failed to save score");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎾</div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading tournament...
          </p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Tournament not found</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gopadel-lightest via-gopadel-light/30 to-gopadel-cyan/20 dark:from-gray-900 dark:via-gopadel-dark/20 dark:to-gopadel-medium/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gopadel-medium dark:hover:text-gopadel-cyan transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gopadel-dark via-gopadel-medium to-gopadel-cyan bg-clip-text text-transparent">
            {tournament.name}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-700 dark:text-gray-300">
            <span className="capitalize font-medium">
              {tournament.tournament_type}
            </span>
            <span>•</span>
            <span>Target: {tournament.target_points} points</span>
            <span>•</span>
            <span>Round {tournament.current_round}</span>
          </div>
        </div>

        {/* Current Match */}
        {currentMatch ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Round {tournament.current_round}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Match Status:{" "}
                <span className="capitalize">{currentMatch.status}</span>
              </p>
            </div>

            {/* Match Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Team A */}
              <div className="p-6 bg-gopadel-light/20 dark:bg-gopadel-dark/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gopadel-dark dark:text-gopadel-light">
                    Team A
                  </h3>
                  <div className="text-3xl font-bold text-gopadel-medium">
                    {teamAScore !== "" ? teamAScore : "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold">
                      {currentMatch.team_a_player1.player_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentMatch.team_a_player1.player_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentMatch.team_a_player1.total_points} pts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold">
                      {currentMatch.team_a_player2.player_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentMatch.team_a_player2.player_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentMatch.team_a_player2.total_points} pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="py-3 bg-gradient-to-r from-gopadel-medium to-gopadel-cyan text-center">
                <span className="text-white font-bold text-xl">VS</span>
              </div>

              {/* Team B */}
              <div className="p-6 bg-gopadel-cyan/20 dark:bg-gopadel-medium/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gopadel-dark dark:text-gopadel-light">
                    Team B
                  </h3>
                  <div className="text-3xl font-bold text-gopadel-cyan dark:text-gopadel-cyan">
                    {teamBScore !== "" ? teamBScore : "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold">
                      {currentMatch.team_b_player1.player_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentMatch.team_b_player1.player_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentMatch.team_b_player1.total_points} pts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold">
                      {currentMatch.team_b_player2.player_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentMatch.team_b_player2.player_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentMatch.team_b_player2.total_points} pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Input */}
            {currentMatch.status === "pending" && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Enter Final Score
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter one teams score - the other will auto-calculate to sum
                  to {tournament.target_points}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team A Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={tournament.target_points}
                      value={teamAScore}
                      onChange={(e) => handleTeamAScoreChange(e.target.value)}
                      className="w-full px-4 py-3 text-2xl font-bold text-center rounded-lg border-2 border-gopadel-light dark:border-gopadel-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gopadel-medium focus:border-gopadel-medium"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team B Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={tournament.target_points}
                      value={teamBScore}
                      onChange={(e) => handleTeamBScoreChange(e.target.value)}
                      className="w-full px-4 py-3 text-2xl font-bold text-center rounded-lg border-2 border-gopadel-cyan dark:border-gopadel-cyan bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gopadel-cyan focus:border-gopadel-cyan"
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleSubmitScore}
                  disabled={
                    teamAScore === "" || teamBScore === "" || submitting
                  }
                  className="w-full"
                >
                  {submitting ? "Saving..." : "Submit Score & Continue"}
                </Button>
              </div>
            )}

            {currentMatch.status === "completed" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  ✓ Match completed! Generating next round...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tournament Complete! 🎉
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              All rounds have been played
            </p>
          </div>
        )}

        {/* Match History Toggle Button */}
        <div className="max-w-3xl mx-auto mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowMatchHistory(!showMatchHistory)}
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showMatchHistory ? "Hide" : "Show"} Match History (
            {completedMatches.length})
          </Button>
        </div>

        {/* Match History View */}
        {showMatchHistory && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Match History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                All completed matches in this tournament
              </p>

              {completedMatches.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No completed matches yet. Finish the current match to see it
                  here!
                </p>
              ) : (
                <div className="space-y-4">
                  {completedMatches.map((match) => {
                    const teamAWon =
                      (match.team_a_score || 0) > (match.team_b_score || 0);
                    return (
                      <div
                        key={match.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Round {match.round_number}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Team A */}
                            <div
                              className={`flex-1 ${
                                teamAWon ? "opacity-100" : "opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_a_player1_id
                                  ).charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getPlayerName(match.team_a_player1_id)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_a_player2_id
                                  ).charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getPlayerName(match.team_a_player2_id)}
                                </span>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-4 px-6">
                              <div
                                className={`text-3xl font-bold ${
                                  teamAWon ? "text-green-600" : "text-gray-400"
                                }`}
                              >
                                {match.team_a_score}
                              </div>
                              <span className="text-gray-400">-</span>
                              <div
                                className={`text-3xl font-bold ${
                                  !teamAWon ? "text-green-600" : "text-gray-400"
                                }`}
                              >
                                {match.team_b_score}
                              </div>
                            </div>

                            {/* Team B */}
                            <div
                              className={`flex-1 text-right ${
                                !teamAWon ? "opacity-100" : "opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-end gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getPlayerName(match.team_b_player1_id)}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_b_player1_id
                                  ).charAt(0)}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getPlayerName(match.team_b_player2_id)}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_b_player2_id
                                  ).charAt(0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Leaderboard
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-2xl font-bold ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-400"
                          : index === 2
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {player.player_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {player.matches_played} matches • {player.matches_won}{" "}
                        wins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gopadel-medium">
                      {player.total_points}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
