import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
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

    const whereItem = collegeId ? { collegeId } : {};

    const claims = await prisma.claim.findMany({
      where: {
        item: whereItem
      },
      include: {
        item: true,
        claimant: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ claims }, { status: 200 });
  } catch (error) {
    console.error("Admin Claims API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
