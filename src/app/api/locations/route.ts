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

    // Get the user's collegeId to fetch the correct hierarchy
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { collegeId: true }
    });

    if (!user || !user.collegeId) {
      return NextResponse.json({ message: "User is not assigned to a college" }, { status: 400 });
    }

    const collegeId = user.collegeId;

    // Fetch the full hierarchy: Campus -> Building -> Floor -> Area
    const campuses = await prisma.campus.findMany({
      where: { collegeId },
      include: {
        buildings: {
          include: {
            floors: {
              include: {
                areas: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ campuses, collegeId }, { status: 200 });
  } catch (error) {
    console.error("Fetch Locations Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
