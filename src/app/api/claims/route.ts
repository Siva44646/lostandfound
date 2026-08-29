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

    const { itemId, proofText } = await req.json();

    if (!itemId || !proofText) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    if (item.userId === userId) {
      return NextResponse.json({ message: "You cannot claim your own item" }, { status: 400 });
    }

    // Check if claim already exists
    const existingClaim = await prisma.claim.findFirst({
      where: { itemId, claimantId: userId }
    });

    if (existingClaim) {
      return NextResponse.json({ message: "You have already submitted a claim for this item" }, { status: 400 });
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: userId,
        proofText,
        status: "PENDING"
      }
    });

    // Update item status
    await prisma.item.update({
      where: { id: itemId },
      data: { status: "CLAIM_REQUESTED" }
    });

    // Notify the item owner
    await prisma.notification.create({
      data: {
        userId: item.userId,
        type: "CLAIM",
        content: `Someone has submitted a claim for your item: ${item.title}`,
        link: `/dashboard`
      }
    });

    return NextResponse.json({ message: "Claim submitted successfully", claimId: claim.id }, { status: 201 });
  } catch (error) {
    console.error("Claim API Error:", error);
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

    // Fetch claims made by the user
    const myClaims = await prisma.claim.findMany({
      where: { claimantId: userId },
      include: {
        item: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch claims made AGAINST the user's items
    const receivedClaims = await prisma.claim.findMany({
      where: {
        item: {
          userId: userId
        }
      },
      include: {
        item: true,
        claimant: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ myClaims, receivedClaims }, { status: 200 });
  } catch (error) {
    console.error("Get Claims API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
