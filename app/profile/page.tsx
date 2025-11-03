import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/types/database";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];
type TournamentStatus = Database["public"]["Enums"]["tournament_status"];

interface TournamentWithCount extends Tournament {
  tournament_players: { count: number }[];
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to sign in if not authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch tournaments created by the user
  const { data: tournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select(
      `
      *,
      tournament_players(count)
    `
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (tournamentsError) {
    console.error("Error fetching tournaments:", tournamentsError);
  }

  // Calculate total stats from tournaments
  const totalTournaments = tournaments?.length || 0;
  let totalMatches = 0;
  let totalWins = 0;

  // Fetch match statistics for the user
  if (tournaments && tournaments.length > 0) {
    for (const tournament of tournaments) {
      const { data: players } = await supabase
        .from("tournament_players")
        .select("matches_played, matches_won")
        .eq("tournament_id", tournament.id);

      if (players) {
        players.forEach((player) => {
          totalMatches += player.matches_played || 0;
          totalWins += player.matches_won || 0;
        });
      }
    }
  }

  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gopadel-lightest via-gopadel-light/30 to-gopadel-cyan/20 dark:from-gray-900 dark:via-gopadel-dark/20 dark:to-gopadel-medium/10">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* User Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gopadel-medium to-gopadel-cyan flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : user.email?.[0].toUpperCase()}
                </div>

                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gopadel-dark dark:text-gopadel-light">
                    {user.user_metadata?.full_name || "User"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gopadel-medium">
                        {totalTournaments}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Tournaments
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gopadel-medium">
                        {totalMatches}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Matches
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gopadel-medium">
                        {winRate}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Win Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  asChild
                  className="bg-gopadel-medium hover:bg-gopadel-dark text-white"
                >
                  <Link href="/tournament/create">Create Tournament</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Tournaments Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gopadel-dark dark:text-gopadel-light">
                My Tournaments
              </h2>
              <Button
                asChild
                size="sm"
                className="bg-gopadel-medium hover:bg-gopadel-dark text-white"
              >
                <Link href="/tournament/create">Create New</Link>
              </Button>
            </div>

            {/* Tournament List */}
            {!tournaments || tournaments.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎾</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No tournaments yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first tournament to get started
                </p>
                <Button
                  asChild
                  className="bg-gopadel-medium hover:bg-gopadel-dark text-white"
                >
                  <Link href="/tournament/create">Create Tournament</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {tournaments.map((tournament: TournamentWithCount) => {
                  const playerCount = tournament.tournament_players?.[0]?.count || 0;
                  const statusColors: Record<TournamentStatus, string> = {
                    draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  };

                  return (
                    <Link
                      key={tournament.id}
                      href={`/tournament/${tournament.id}`}
                      className="block p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-gopadel-medium dark:hover:border-gopadel-cyan transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-gopadel-medium transition-colors mb-2">
                            {tournament.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {playerCount} players
                            </span>
                            <span>•</span>
                            <span className="capitalize">{tournament.tournament_type}</span>
                            <span>•</span>
                            <span>Target: {tournament.target_points} pts</span>
                            <span>•</span>
                            <span>Round {tournament.current_round}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[tournament.status]}`}>
                          {tournament.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(tournament.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-gopadel-medium dark:text-gopadel-cyan font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          View Details →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6 text-center">
              <div className="text-4xl font-bold text-gopadel-medium mb-2">
                {tournaments?.filter((t: TournamentWithCount) => t.status === "completed").length || 0}
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Completed Tournaments
              </h3>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6 text-center">
              <div className="text-4xl font-bold text-gopadel-medium mb-2">
                {tournaments?.filter((t: TournamentWithCount) => t.status === "active").length || 0}
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Active Tournaments
              </h3>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6 text-center">
              <div className="text-4xl font-bold text-gopadel-medium mb-2">
                {tournaments?.filter((t: TournamentWithCount) => t.status === "draft").length || 0}
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Draft Tournaments
              </h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
