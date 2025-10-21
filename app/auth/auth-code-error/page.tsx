import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center px-4">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Authentication Error
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          There was an error signing you in. Please try again.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
