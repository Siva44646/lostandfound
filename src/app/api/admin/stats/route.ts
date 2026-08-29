import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      // For prototyping, we'll allow access if no specific ADMIN role is enforced yet,
      // but in production, we should uncomment this restriction.
      // return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let collegeId: string | undefined;

    if (session && session.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { collegeId: true }
      });
      if (user?.collegeId) collegeId = user.collegeId;
    }

    const whereUser = collegeId ? { collegeId } : {};
    const whereItem = collegeId ? { collegeId } : {};

    const [
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      totalMatches,
      totalClaims,
      recoveredItems
    ] = await Promise.all([
      prisma.user.count({ where: whereUser }),
      prisma.item.count({ where: whereItem }),
      prisma.item.count({ where: { ...whereItem, type: "LOST" } }),
      prisma.item.count({ where: { ...whereItem, type: "FOUND" } }),
      prisma.match.count(), // We can filter this deeper if needed, but keeping it simple
      prisma.claim.count(),
      prisma.item.count({ where: { ...whereItem, status: "RECOVERED" } })
    ]);

    const recentItems = await prisma.item.findMany({
      where: whereItem,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalItems,
        lostItems,
        foundItems,
        totalMatches,
        totalClaims,
        recoveredItems
      },
      recentItems
    }, { status: 200 });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
