import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="flex items-center justify-center px-6 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-0" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Hero Text */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Padel Tournament
              <br />
              Made Simple
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Track your friendly padel tournaments with ease
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 sm:pt-4">
            <Button size="lg" className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 w-auto">
              <Link href="/tournament/create">Start Tournament</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
