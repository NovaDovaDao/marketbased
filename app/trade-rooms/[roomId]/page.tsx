import { prisma } from "@/app/lib/prisma"
import { auth } from "@/app/utils/auth"
import { TradeRoomChat } from "@/components/TradeRoomChat/TradeRoomChat"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default async function TradeRoomPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/login")
  }

  const { roomId } = await params
  const userId = session.user.id

  const room = await prisma.tradeRoom.findUnique({
    where: { id: roomId },
    include: {
      seller: { select: { id: true, username: true, image: true } },
      buyer: { select: { id: true, username: true, image: true } },
      offer: {
        include: {
          listing: { select: { id: true, name: true, baseName: true, rarity: true, price: true } },
        },
      },
    },
  })

  if (!room) notFound()
  if (room.sellerId !== userId && room.buyerId !== userId) notFound()
  if (!room.seller || !room.buyer || !room.offer?.listing) notFound()

  // Initial message page — server-fetched for instant render
  const initialMessages = await prisma.message.findMany({
    where: { tradeRoomId: roomId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      senderId: true,
      content: true,
      type: true,
      isDeleted: true,
      readAt: true,
      createdAt: true,
      sender: { select: { id: true, username: true, image: true } },
    },
  })

  const counterpartUser = room.sellerId === userId ? room.buyer : room.seller

  return (
    <main className="flex h-dvh flex-col bg-zinc-950">
      <TradeRoomChat
        roomId={roomId}
        roomStatus={room.status}
        currentUserId={userId}
        currentUsername={session.user.name}
        sessionToken={session.session.token}
        seller={room.seller}
        buyer={room.buyer}
        counterpart={counterpartUser}
        listing={room.offer.listing}
        offerData={room.offer.offerData}
        initialMessages={initialMessages.map((m) => ({
          ...m,
          content: m.isDeleted ? "[Message deleted]" : m.content,
          type: (m.type === "system" ? "system" : "text") as "text" | "system",
          createdAt: m.createdAt.toISOString(),
          readAt: m.readAt as Record<string, string> | null,
        }))}
      />
    </main>
  )
}
