interface PresenceIndicatorProps {
  isOnline: boolean
  username: string
}

export function PresenceIndicator({ isOnline, username }: PresenceIndicatorProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1.5"
      title={isOnline ? `${username} is online` : `${username} is offline`}
      aria-label={isOnline ? "Online" : "Offline"}
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-500 ${isOnline ? "bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" : "bg-zinc-600"}`}
      />
      <span className="text-xs text-zinc-500">{isOnline ? "Online" : "Offline"}</span>
    </div>
  )
}
