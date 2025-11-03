import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to sign in if not authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  // TODO: Fetch user's match history from database
  const matches = []; // Placeholder for now

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
                        0
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Matches
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gopadel-medium">
                        0
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Wins
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gopadel-medium">
                        0%
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

          {/* Match History Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gopadel-dark dark:text-gopadel-light">
                Match History
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gopadel-medium text-gopadel-dark"
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  Wins
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  Losses
                </Button>
              </div>
            </div>

            {/* Match List */}
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎾</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No matches yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start playing in tournaments to see your match history here
                </p>
                <Button
                  asChild
                  className="bg-gopadel-medium hover:bg-gopadel-dark text-white"
                >
                  <Link href="/tournament/create">Join a Tournament</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Match cards will go here */}
                {matches.map((match: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gopadel-medium transition-colors"
                  >
                    {/* Match details will be rendered here */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Section (Coming Soon) */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6">
              <h3 className="text-lg font-semibold text-gopadel-dark dark:text-gopadel-light mb-4">
                Recent Performance
              </h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Coming soon
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6">
              <h3 className="text-lg font-semibold text-gopadel-dark dark:text-gopadel-light mb-4">
                Favorite Partners
              </h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Coming soon
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gopadel-light/50 p-6">
              <h3 className="text-lg font-semibold text-gopadel-dark dark:text-gopadel-light mb-4">
                Tournaments Played
              </h3>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
