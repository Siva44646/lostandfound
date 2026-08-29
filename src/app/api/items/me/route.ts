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

    const items = await prisma.item.findMany({
      where: { userId },
      include: {
        college: true,
        campus: true,
        building: true,
        floor: true,
        area: true
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("My Items API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
