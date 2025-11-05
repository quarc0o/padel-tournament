import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Text */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Padel Tournament
              <br />
              Made Simple
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track your friendly padel tournaments with ease
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button size="lg" className="text-lg px-8 py-6">
              <Link href="/tournament/create">Start Tournament</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
