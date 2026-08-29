import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // We want matches where either the lost item or the found item belongs to the user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { lostItem: { userId: userId } },
          { foundItem: { userId: userId } }
        ]
      },
      include: {
        lostItem: { include: { images: true } },
        foundItem: { include: { images: true } }
      },
      orderBy: {
        score: "desc"
      }
    });

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
