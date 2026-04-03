interface PresenceIndicatorProps {
  isOnline: boolean
  username: string
}

export function PresenceIndicator({ isOnline, username }: PresenceIndicatorProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-2.5"
      title={isOnline ? `${username} is online` : `${username} is offline`}
      aria-label={isOnline ? "Online" : "Offline"}
    >
      <span
        className={`h-2 w-2 shrink-0 transition-colors duration-500 ${isOnline
            ? "bg-secondary animate-ember-pulse"
            : "bg-outline-variant/30"
          }`}
      />
      <span className={`text-label-sm transition-colors duration-500 ${isOnline ? "text-secondary/70" : "text-on-surface-variant/30"
        }`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  )
}
