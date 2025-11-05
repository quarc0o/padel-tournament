"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";

interface MobileMenuProps {
  user: User | null;
  initials?: string;
}

export default function MobileMenu({ user, initials }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="md:hidden" ref={menuRef}>
      {/* Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
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
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

          {/* Menu Content */}
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
            <div className="flex flex-col p-6 space-y-4">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user?.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="w-full justify-start text-lg"
                  >
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="w-full justify-start text-lg"
                  >
                    <Link
                      href="/tournament/create"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Tournament
                    </Link>
                  </Button>

                  {/* Sign Out Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="lg"
                      className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start text-lg"
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not logged in */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full text-lg"
                  >
                    <Link href="/auth/sign-in" onClick={() => setIsOpen(false)}>
                      Log In
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full text-lg"
                  >
                    <Link
                      href="/tournament/create"
                      onClick={() => setIsOpen(false)}
                    >
                      Start Tournament
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
