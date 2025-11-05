"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
type Player = Database["public"]["Tables"]["tournament_players"]["Row"];

export default function TournamentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTournamentResults();
    setShareUrl(window.location.href);
  }, [tournamentId]);

  async function fetchTournamentResults() {
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

      // Fetch all players sorted by points
      const { data: playersData, error: playersError } = await supabase
        .from("tournament_players")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("total_points", { ascending: false });

      if (playersError) throw playersError;

      setPlayers(playersData);
    } catch (error) {
      console.error("Error fetching tournament results:", error);
      alert("Failed to load tournament results");
    } finally {
      setLoading(false);
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tournament?.name} - Final Results`,
          text: `Check out the final results of ${tournament?.name}!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMedalEmoji = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-white text-xl font-semibold">
            Loading results...
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
          <Link href="/profile" className="text-blue-600 hover:underline mt-4 block">
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  const topThree = players.slice(0, 3);
  const remaining = players.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gopadel-lightest via-gopadel-light/30 to-gopadel-cyan/20 dark:from-gray-900 dark:via-gopadel-dark/20 dark:to-gopadel-medium/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <Link
              href={`/tournament/${tournamentId}?view=matches`}
              className="text-gray-600 dark:text-gray-400 hover:text-gopadel-medium dark:hover:text-gopadel-cyan transition-colors text-sm font-medium"
            >
              ← View Match History
            </Link>
          </div>
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Tournament Complete
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gopadel-medium dark:text-gopadel-cyan mb-2">
            {tournament.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Final Results • {players.length} Players
          </p>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-16">
            <div className="flex items-end justify-center gap-6 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-24 h-24 rounded-full shadow-lg border-4 border-gray-300 dark:border-gray-500 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <PlayerAvatar
                        name={topThree[1].player_name}
                        avatarUrl={topThree[1].avatar_url}
                        size="xl"
                        className="w-full h-full text-3xl"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">
                      {getMedalEmoji(1)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                    {topThree[1].player_name}
                  </h3>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                    {topThree[1].total_points}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">points</p>
                  <div className="w-full h-36 bg-gray-200 dark:bg-gray-700 rounded-t-2xl shadow-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                    <span className="text-6xl font-bold text-gray-300 dark:text-gray-600">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place - Center and Tallest */}
              {topThree[0] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-32 h-32 rounded-full shadow-lg border-4 border-yellow-400 dark:border-yellow-500 overflow-hidden bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-600 dark:to-yellow-500 flex items-center justify-center">
                      <PlayerAvatar
                        name={topThree[0].player_name}
                        avatarUrl={topThree[0].avatar_url}
                        size="xl"
                        className="w-full h-full text-4xl"
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 text-5xl">
                      {getMedalEmoji(0)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
                    {topThree[0].player_name}
                  </h3>
                  <p className="text-4xl font-bold text-gopadel-medium dark:text-gopadel-cyan">
                    {topThree[0].total_points}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">points</p>
                  <div className="w-full h-48 bg-yellow-200 dark:bg-yellow-700 rounded-t-2xl shadow-lg flex items-center justify-center border-2 border-yellow-300 dark:border-yellow-600">
                    <span className="text-8xl font-bold text-yellow-300 dark:text-yellow-600">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-20 h-20 rounded-full shadow-lg border-4 border-orange-300 dark:border-orange-500 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-300 dark:from-orange-700 dark:to-orange-600 flex items-center justify-center">
                      <PlayerAvatar
                        name={topThree[2].player_name}
                        avatarUrl={topThree[2].avatar_url}
                        size="lg"
                        className="w-full h-full text-2xl"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 text-3xl">
                      {getMedalEmoji(2)}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
                    {topThree[2].player_name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {topThree[2].total_points}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">points</p>
                  <div className="w-full h-28 bg-orange-200 dark:bg-orange-700 rounded-t-2xl shadow-lg flex items-center justify-center border-2 border-orange-300 dark:border-orange-600">
                    <span className="text-5xl font-bold text-orange-300 dark:text-orange-600">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remaining Players */}
        {remaining.length > 0 && (
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
              Other Participants
            </h3>
            <div className="space-y-3">
              {remaining.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-gopadel-medium dark:hover:border-gopadel-cyan transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 w-10 text-center">
                        {index + 4}
                      </div>
                      <PlayerAvatar
                        name={player.player_name}
                        avatarUrl={player.avatar_url}
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {player.player_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {player.matches_played} matches • {player.matches_won}{" "}
                          wins
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gopadel-medium dark:text-gopadel-cyan">
                        {player.total_points}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="max-w-md mx-auto space-y-3">
          <Button
            size="lg"
            onClick={handleShare}
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Results
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleCopyLink}
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? "Link Copied! ✓" : "Copy Link"}
          </Button>
        </div>

        {/* Tournament Info Footer */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            {tournament.tournament_type.charAt(0).toUpperCase() +
              tournament.tournament_type.slice(1)}{" "}
            Tournament • Target: {tournament.target_points} points
          </p>
          <p className="text-sm mt-1">
            Completed in {tournament.current_round} rounds
          </p>
        </div>
      </div>
    </div>
  );
}
