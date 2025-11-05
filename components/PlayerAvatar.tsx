import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-12 h-12 text-lg",
};

function getInitials(name: string): string {
  if (!name) return "?";

  const names = name.trim().split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
}

export function PlayerAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: PlayerAvatarProps) {
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML = `
              <div class="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold flex-shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
