import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import UserButton from "./UserButton";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user initials from name or email
  const getInitials = (user: User) => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(" ");
      return names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const initials = user ? getInitials(user) : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/gopadel_logo.png"
              alt="GoPadel Logo"
              width={150}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Auth Button */}
          <div className="flex items-center gap-4">
            {user ? (
              <UserButton initials={initials!} user={user} />
            ) : (
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/sign-in">Log In</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
