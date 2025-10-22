import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Emoji */}
            <div className="flex justify-center">
              <div className="text-8xl sm:text-9xl">🎾</div>
            </div>

            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Padel Tournament
                <br />
                Made Simple
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Track your friendly padel tournaments with ease. Compete, climb
                the leaderboard, and have fun!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild variant="primary" size="xl" className="group">
                <Link href="/tournament/create">
                  Start Tournament
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </Button>
              <Button variant="secondary" size="xl">
                Learn More
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 pt-20 max-w-5xl mx-auto">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  Track Tournaments
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize and manage tournaments with your friends effortlessly
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  Live Leaderboards
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See real-time rankings and stats as matches progress
                </p>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  Play with Friends
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Invite friends and build a community of padel enthusiasts
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm">Built with ❤️ for padel lovers everywhere</p>
      </footer>
    </div>
  );
}
