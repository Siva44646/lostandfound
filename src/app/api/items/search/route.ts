import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";

    const session = await getServerSession(authOptions);
    let userCollegeId = null;

    if (session && session.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { collegeId: true }
      });
      userCollegeId = user?.collegeId;
    }

    const where: any = {
      status: { in: ["ACTIVE", "POSSIBLE_MATCH"] }
    };

    if (userCollegeId) {
      where.collegeId = userCollegeId;
    }

    if (type && (type === "LOST" || type === "FOUND")) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { locationName: { contains: q } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        images: true,
        college: true,
        campus: true,
        building: true,
        floor: true,
        area: true
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
