import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, claimId } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const senderId = (session.user as any).id;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        claimId
      }
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE",
        content: `New message from ${(session.user as any).name}`,
        link: `/messages/${senderId}`
      }
    });

    return NextResponse.json({ message: "Message sent", data: message }, { status: 201 });
  } catch (error) {
    console.error("Message API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (otherUserId) {
      // Fetch specific conversation
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: "asc" }
      });

      // Mark unread as read
      await prisma.message.updateMany({
        where: { receiverId: userId, senderId: otherUserId, isRead: false },
        data: { isRead: true }
      });

      return NextResponse.json({ messages }, { status: 200 });
    } else {
      // Fetch list of conversations (latest message per user pair)
      // Since SQLite doesn't have DISTINCT ON, we'll fetch recent messages and group in JS
      const allMessages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } }
        }
      });

      const conversationsMap = new Map();
      allMessages.forEach(msg => {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!conversationsMap.has(otherUser.id)) {
          conversationsMap.set(otherUser.id, {
            user: otherUser,
            latestMessage: msg,
            unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
          });
        } else if (msg.receiverId === userId && !msg.isRead) {
          const convo = conversationsMap.get(otherUser.id);
          convo.unreadCount += 1;
        }
      });

      return NextResponse.json({ conversations: Array.from(conversationsMap.values()) }, { status: 200 });
    }
  } catch (error) {
    console.error("Message API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
