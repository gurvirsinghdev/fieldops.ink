"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/user-store";

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-24 w-24",
} as const;

type Props = {
  className?: string;
  size?: keyof typeof sizeClasses;
};

export function UserAvatar({ className, size = "default" }: Props) {
  const user = useUserStore((s) => s.user);

  const initials = user?.name
    ? user.name.split(/\s+/).map((n) => n[0]).join("")
    : "";

  return (
    <Avatar className={`${sizeClasses[size]} ${className ?? ""}`}>
      <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
