import type { Rune } from "@/types/rune"
import { formatPrice } from "@/types/rune"
import type { TradeHistoryEntry } from "@/types/user"
import Image from "next/image"

export interface UserProfileActivityProps {
  history: TradeHistoryEntry[]
  runes: Rune[]
}

const ACTION_LABEL: Record<string, string> = {
  sold: "Sold",
  bought: "Bought",
  traded: "Traded",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function UserProfileActivity({ history, runes }: UserProfileActivityProps) {
  const runeMap = new Map<number, Rune>(runes.map((r) => [r.id, r]))

  return (
    <section aria-label="Trade history" className="flex flex-col gap-6">
      {/* Section heading */}
      <h2 className="font-headline text-xl font-extrabold uppercase italic tracking-widest text-secondary md:text-2xl">
        Recent Activity
      </h2>

      {history.length === 0 ? (
        <p className="font-headline text-sm text-on-surface-variant/40">No trade history yet.</p>
      ) : (
        <ol aria-label="Trade history feed" className="flex flex-col gap-2">
          {history.map((entry, idx) => {
            const rune = runeMap.get(entry.runeId)
            const isCompleted = entry.state === "completed"

            return (
              <li
                key={entry.id}
                className="flex items-center gap-4 bg-surface-container-low px-4 py-4 transition-colors duration-300 hover:bg-surface-container"
                aria-label={`${ACTION_LABEL[entry.type]} ${rune?.name ?? "Unknown Rune"} — ${entry.state}`}
              >
                {/* Rune image socket */}
                <div
                  className="relative h-12 w-12 shrink-0 bg-surface-container-lowest"
                  style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)" }}
                  aria-hidden="true"
                >
                  {rune && (
                    <Image
                      src={rune.image}
                      alt={rune.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                      unoptimized
                    />
                  )}
                </div>

                {/* Text content */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <p className="font-headline text-sm font-semibold leading-snug text-on-surface">
                    <span className="text-on-surface-variant/60">{ACTION_LABEL[entry.type]}</span>{" "}
                    {rune?.name ?? `Rune #${entry.runeId}`}{" "}
                    {entry.type !== "traded" && (
                      <>
                        <span className="text-on-surface-variant/40">·</span>{" "}
                        <span className="text-secondary">{formatPrice(entry.priceCents)} Gold</span>
                      </>
                    )}
                  </p>
                  <p className="font-headline text-xs text-on-surface-variant/45 truncate">
                    with @{entry.withUser} · {formatDate(entry.completedAt)}
                  </p>
                </div>

                {/* Status badge */}
                <div
                  className="shrink-0 px-3 py-1"
                  style={{
                    background: isCompleted
                      ? "rgba(31,80,40,0.35)"
                      : "rgba(147,0,10,0.35)",
                  }}
                  aria-label={`Status: ${entry.state}`}
                >
                  <span
                    className="font-headline text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: isCompleted ? "#6fba7f" : "#ffb4ab" }}
                  >
                    {isCompleted ? "Complete" : "Cancelled"}
                  </span>
                </div>

                {/* Timeline index */}
                <span className="hidden shrink-0 font-headline text-xs text-on-surface-variant/20 md:block">
                  #{String(idx + 1).padStart(2, "0")}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
