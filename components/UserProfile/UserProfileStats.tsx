import type { UserReputation, UserStats } from "@/types/user"

export interface UserProfileStatsProps {
  stats: UserStats
  reputation: UserReputation
  memberSince: string
}

interface StatCellProps {
  value: string
  label: string
}

function StatCell({ value, label }: StatCellProps) {
  return (
    <div className="flex flex-col items-start gap-1 px-6 py-5">
      <span className="font-headline text-2xl font-extrabold italic leading-none text-secondary md:text-3xl">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-widest text-on-surface-variant/50">
        {label}
      </span>
    </div>
  )
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

export default function UserProfileStats({ stats, memberSince }: UserProfileStatsProps) {
  const cells: StatCellProps[] = [
    { value: stats.totalTrades.toLocaleString(), label: "Total Trades" },
    { value: stats.spaceDust.toLocaleString(), label: "Space Dust" },
    { value: stats.activeListings.toString(), label: "Active Listings" },
    { value: formatMemberSince(memberSince), label: "Member Since" },
  ]

  return (
    <section
      aria-label="Trade statistics"
      className="w-full bg-surface-container"
      style={{ boxShadow: "inset 0 1px 0 rgba(247,189,72,0.06)" }}
    >
      {/* Subtle gold rule at top */}
      <div className="h-px w-full" style={{ background: "rgba(247,189,72,0.12)" }} aria-hidden="true" />

      <div className="grid grid-cols-2 md:grid-cols-4">
        {cells.map(({ value, label }, i) => (
          <div key={label} className="relative">
            <StatCell value={value} label={label} />
            {/* Vertical separator between cells (ghost, felt not seen) */}
            {i < cells.length - 1 && (
              <div
                className="absolute right-0 top-4 h-[calc(100%-2rem)] w-px"
                style={{ background: "rgba(68,71,72,0.4)" }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      <div className="h-px w-full" style={{ background: "rgba(68,71,72,0.3)" }} aria-hidden="true" />
    </section>
  )
}
