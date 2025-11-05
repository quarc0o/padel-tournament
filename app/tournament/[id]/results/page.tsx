"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
type Player = Database["public"]["Tables"]["tournament_players"]["Row"];

interface PlayerWithProfile extends Player {
  profileImage?: string;
  email?: string;
  fullName?: string;
}

export default function TournamentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<PlayerWithProfile[]>([]);
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

      // Get current user to check profile images
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Enhance players with profile data if available
      const enhancedPlayers: PlayerWithProfile[] = playersData.map((player) => ({
        ...player,
        // For now, we'll use generic data. In a real app, you'd fetch user profiles
        profileImage: user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
        email: user?.email,
        fullName: user?.user_metadata?.full_name,
      }));

      setPlayers(enhancedPlayers);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPodiumHeight = (position: number) => {
    if (position === 0) return "h-48"; // 1st place (tallest)
    if (position === 1) return "h-36"; // 2nd place
    if (position === 2) return "h-28"; // 3rd place
    return "h-24";
  };

  const getPodiumColor = (position: number) => {
    if (position === 0) return "from-yellow-400 to-yellow-600"; // Gold
    if (position === 1) return "from-gray-300 to-gray-500"; // Silver
    if (position === 2) return "from-orange-400 to-orange-600"; // Bronze
    return "from-gray-200 to-gray-400";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Link
              href={`/tournament/${tournamentId}`}
              className="text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              ← Back to Tournament
            </Link>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 drop-shadow-lg">
            🏆 Tournament Complete!
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-white/90 mb-2">
            {tournament.name}
          </h2>
          <p className="text-white/80 text-lg">
            Final Results • {players.length} Players
          </p>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-16">
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center text-4xl font-bold text-gray-700 border-4 border-gray-400">
                      {topThree[1].profileImage ? (
                        <img
                          src={topThree[1].profileImage}
                          alt={topThree[1].player_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(topThree[1].player_name)
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">
                      {getMedalEmoji(1)}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-1 drop-shadow">
                    {topThree[1].player_name}
                  </h3>
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {topThree[1].total_points}
                  </p>
                  <p className="text-white/80 text-sm mb-4">points</p>
                  <div
                    className={`w-full ${getPodiumHeight(
                      1
                    )} bg-gradient-to-b ${getPodiumColor(
                      1
                    )} rounded-t-2xl shadow-2xl flex items-center justify-center`}
                  >
                    <span className="text-6xl font-black text-white/30">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place - Center and Tallest */}
              {topThree[0] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center text-5xl font-bold text-yellow-600 border-4 border-yellow-400">
                      {topThree[0].profileImage ? (
                        <img
                          src={topThree[0].profileImage}
                          alt={topThree[0].player_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(topThree[0].player_name)
                      )}
                    </div>
                    <div className="absolute -top-3 -right-3 text-5xl animate-pulse">
                      {getMedalEmoji(0)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-1 drop-shadow">
                    {topThree[0].player_name}
                  </h3>
                  <p className="text-4xl font-black text-white drop-shadow-lg">
                    {topThree[0].total_points}
                  </p>
                  <p className="text-white/80 text-sm mb-4">points</p>
                  <div
                    className={`w-full ${getPodiumHeight(
                      0
                    )} bg-gradient-to-b ${getPodiumColor(
                      0
                    )} rounded-t-2xl shadow-2xl flex items-center justify-center`}
                  >
                    <span className="text-8xl font-black text-white/30">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center flex-1 max-w-xs">
                  <div className="mb-4 relative">
                    <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center text-3xl font-bold text-orange-600 border-4 border-orange-400">
                      {topThree[2].profileImage ? (
                        <img
                          src={topThree[2].profileImage}
                          alt={topThree[2].player_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(topThree[2].player_name)
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 text-3xl">
                      {getMedalEmoji(2)}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white text-center mb-1 drop-shadow">
                    {topThree[2].player_name}
                  </h3>
                  <p className="text-2xl font-black text-white drop-shadow-lg">
                    {topThree[2].total_points}
                  </p>
                  <p className="text-white/80 text-sm mb-4">points</p>
                  <div
                    className={`w-full ${getPodiumHeight(
                      2
                    )} bg-gradient-to-b ${getPodiumColor(
                      2
                    )} rounded-t-2xl shadow-2xl flex items-center justify-center`}
                  >
                    <span className="text-5xl font-black text-white/30">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remaining Players */}
        {remaining.length > 0 && (
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Other Participants
            </h3>
            <div className="space-y-3">
              {remaining.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl font-black text-gray-400 w-12 text-center">
                        {index + 4}
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {player.profileImage ? (
                          <img
                            src={player.profileImage}
                            alt={player.player_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(player.player_name)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">
                          {player.player_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {player.matches_played} matches • {player.matches_won}{" "}
                          wins
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {player.total_points}
                      </p>
                      <p className="text-sm text-gray-600">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        <div className="max-w-md mx-auto space-y-4">
          <Button
            size="lg"
            onClick={handleShare}
            className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold text-lg py-6 shadow-2xl"
          >
            <svg
              className="w-6 h-6 mr-2"
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
            className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30 font-semibold backdrop-blur-sm"
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
        <div className="text-center mt-12 text-white/80">
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
