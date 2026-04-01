import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = { title: "Trade Rooms — Marketbased" }

export default async function TradeRoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const userId = session.user.id

  const rooms = await prisma.tradeRoom.findMany({
    where: { OR: [{ sellerId: userId }, { buyerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      buyer: { select: { id: true, username: true, image: true } },
      offer: {
        select: {
          id: true,
          listing: { select: { id: true, name: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        where: { isDeleted: false },
        select: { content: true, senderId: true, type: true, createdAt: true },
      },
    },
  })

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 md:px-8">
      <h1 className="mb-8 font-headline text-2xl font-extrabold italic tracking-editorial text-secondary sm:text-3xl">
        Trade Rooms
      </h1>

      {rooms.length === 0 ? (
        <p className="font-headline text-sm text-on-surface-variant/50">
          No trade rooms yet. Accept an offer to start a negotiation.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rooms.map((room) => {
            const other = room.sellerId === userId ? room.buyer : room.seller
            const lastMsg = room.messages[0]
            const preview =
              lastMsg?.type === "system"
                ? lastMsg.content
                : lastMsg?.senderId === userId
                  ? `You: ${lastMsg.content}`
                  : lastMsg?.content ?? "No messages yet"

            return (
              <li key={room.id}>
                <Link
                  href={`/trade-rooms/${room.id}`}
                  className="flex items-center gap-4 bg-surface-container p-4 transition-colors hover:bg-surface-container-high"
                >
                  {/* Avatar */}
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden bg-surface-container-low">
                    <Image
                      src={other.image ?? "/avatars/default.webp"}
                      alt={other.username}
                      fill
                      sizes="44px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-headline text-sm font-bold text-on-surface">
                        @{other.username}
                      </span>
                      {room.offer?.listing && (
                        <span className="shrink-0 text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                          {room.offer.listing.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant/60">
                      {preview}
                    </p>
                  </div>

                  {/* Status dot */}
                  <div
                    className="ml-2 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: room.status === "open" ? "#4caf50" : "rgba(255,255,255,0.15)",
                    }}
                    aria-label={room.status}
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
