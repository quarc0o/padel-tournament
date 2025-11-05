"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { completeMatchAndGenerateNext } from "@/lib/matchGeneration";
import { PlayerAvatar } from "@/components/PlayerAvatar";

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
  const [viewMatches, setViewMatches] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we should show matches view
    const urlParams = new URLSearchParams(window.location.search);
    setViewMatches(urlParams.get("view") === "matches");

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

      // Check if tournament is completed and redirect to results
      const urlParams = new URLSearchParams(window.location.search);
      if (
        tournamentData.status === "completed" &&
        urlParams.get("view") !== "matches"
      ) {
        console.log("Tournament is completed - redirecting to results");
        setIsRedirecting(true);
        router.replace(`/tournament/${tournamentId}/results`);
        return;
      }

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
          // No match found - tournament is complete
          console.log("No current match found - tournament complete");

          // If not viewing matches explicitly, redirect to results
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("view") !== "matches") {
            setIsRedirecting(true);
            router.replace(`/tournament/${tournamentId}/results`);
            return;
          }
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
        setIsRedirecting(true);
        // Redirect to results page
        router.replace(`/tournament/${tournamentId}/results`);
      } else {
        console.log("✅ Next match generated for Round", result.nextRound);
        alert(`Score saved! Moving to Round ${result.nextRound}...`);
        // Reload the page to show the new match
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving score:", error);
      alert("Failed to save score");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">
            {isRedirecting ? "🏆" : "🎾"}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRedirecting ? "Redirecting to results..." : "Loading tournament..."}
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gopadel-medium dark:hover:text-gopadel-cyan transition-colors mb-2"
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {tournament.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className="capitalize font-medium">
              {tournament.tournament_type}
            </span>
            <span>•</span>
            <span>Target: {tournament.target_points} pts</span>
            <span>•</span>
            <span className="font-semibold">Round {tournament.current_round}</span>
          </div>
        </div>

        {/* Current Match */}
        {currentMatch ? (
          <div className="space-y-4">
            {/* Match Display - Padel Court Layout */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              {/* Match Status */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Match Status:{" "}
                  <span className="capitalize font-medium">{currentMatch.status}</span>
                </p>
              </div>

              {/* Court Layout: 2 vs 2 */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Left Side - Team A */}
                <div className="space-y-3">
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-gopadel-medium mb-1">
                      Team A
                    </h3>
                  </div>

                  {/* Player 1 */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border-2 border-gopadel-light dark:border-gopadel-medium">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        name={currentMatch.team_a_player1.player_name}
                        avatarUrl={currentMatch.team_a_player1.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {currentMatch.team_a_player1.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentMatch.team_a_player1.total_points} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border-2 border-gopadel-light dark:border-gopadel-medium">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        name={currentMatch.team_a_player2.player_name}
                        avatarUrl={currentMatch.team_a_player2.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {currentMatch.team_a_player2.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentMatch.team_a_player2.total_points} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Input for Team A */}
                  {currentMatch.status === "pending" && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 text-center">
                        Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={tournament.target_points}
                        value={teamAScore}
                        onChange={(e) => handleTeamAScoreChange(e.target.value)}
                        className="w-full px-3 py-2 text-3xl font-bold text-center rounded-lg border-2 border-gopadel-light dark:border-gopadel-medium bg-white dark:bg-gray-800 text-gopadel-medium dark:text-gopadel-light focus:ring-2 focus:ring-gopadel-medium focus:border-gopadel-medium outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                  {currentMatch.status === "completed" && (
                    <div className="pt-2 text-center">
                      <div className="text-4xl font-bold text-gopadel-medium">
                        {teamAScore !== "" ? teamAScore : "-"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Team B */}
                <div className="space-y-3">
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-gopadel-cyan mb-1">
                      Team B
                    </h3>
                  </div>

                  {/* Player 1 */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border-2 border-gopadel-cyan dark:border-gopadel-cyan">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        name={currentMatch.team_b_player1.player_name}
                        avatarUrl={currentMatch.team_b_player1.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {currentMatch.team_b_player1.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentMatch.team_b_player1.total_points} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border-2 border-gopadel-cyan dark:border-gopadel-cyan">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar
                        name={currentMatch.team_b_player2.player_name}
                        avatarUrl={currentMatch.team_b_player2.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {currentMatch.team_b_player2.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentMatch.team_b_player2.total_points} pts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Input for Team B */}
                  {currentMatch.status === "pending" && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 text-center">
                        Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={tournament.target_points}
                        value={teamBScore}
                        onChange={(e) => handleTeamBScoreChange(e.target.value)}
                        className="w-full px-3 py-2 text-3xl font-bold text-center rounded-lg border-2 border-gopadel-cyan dark:border-gopadel-cyan bg-white dark:bg-gray-800 text-gopadel-cyan dark:text-gopadel-cyan focus:ring-2 focus:ring-gopadel-cyan focus:border-gopadel-cyan outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                  {currentMatch.status === "completed" && (
                    <div className="pt-2 text-center">
                      <div className="text-4xl font-bold text-gopadel-cyan">
                        {teamBScore !== "" ? teamBScore : "-"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Helper Text */}
              {currentMatch.status === "pending" && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter one score - the other auto-calculates to {tournament.target_points}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {currentMatch.status === "pending" && (
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
            )}

            {currentMatch.status === "completed" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-200 font-semibold text-sm">
                  ✓ Match completed! Generating next round...
                </p>
              </div>
            )}
          </div>
        ) : viewMatches ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Tournament Complete
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                All rounds have been played. View the final results below or check match history.
              </p>
              <Button
                size="lg"
                asChild
              >
                <Link href={`/tournament/${tournamentId}/results`}>
                  View Final Results
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {/* Match History Toggle Button */}
        <div className="mb-4">
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
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Match History
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                All completed matches in this tournament
              </p>

              {completedMatches.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
                  No completed matches yet. Finish the current match to see it
                  here!
                </p>
              ) : (
                <div className="space-y-3">
                  {completedMatches.map((match) => {
                    const teamAWon =
                      (match.team_a_score || 0) > (match.team_b_score || 0);
                    return (
                      <div
                        key={match.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <div className="bg-white dark:bg-gray-700 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Round {match.round_number}
                          </span>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-700">
                          <div className="flex items-center justify-between gap-2">
                            {/* Team A */}
                            <div
                              className={`flex-1 ${
                                teamAWon ? "opacity-100" : "opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_a_player1_id
                                  ).charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {getPlayerName(match.team_a_player1_id)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_a_player2_id
                                  ).charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {getPlayerName(match.team_a_player2_id)}
                                </span>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-2 px-2 flex-shrink-0">
                              <div
                                className={`text-2xl font-bold ${
                                  teamAWon ? "text-green-600" : "text-gray-400"
                                }`}
                              >
                                {match.team_a_score}
                              </div>
                              <span className="text-gray-400 text-sm">-</span>
                              <div
                                className={`text-2xl font-bold ${
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
                              <div className="flex items-center justify-end gap-2 mb-1.5">
                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {getPlayerName(match.team_b_player1_id)}
                                </span>
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                                  {getPlayerName(
                                    match.team_b_player1_id
                                  ).charAt(0)}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {getPlayerName(match.team_b_player2_id)}
                                </span>
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-xs">
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
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Leaderboard
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 sm:p-4 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-lg sm:text-xl font-bold min-w-[24px] ${
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
                    <PlayerAvatar
                      name={player.player_name}
                      avatarUrl={player.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {player.player_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.matches_played} matches • {player.matches_won}{" "}
                        wins
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-gopadel-medium">
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
