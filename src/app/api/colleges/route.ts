import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json({ colleges }, { status: 200 });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json({ message: "Internal server error", error: String(error) }, { status: 500 });
  }
}
