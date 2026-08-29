import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    const { id: claimId } = await params;

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: true, claimant: true }
    });

    if (!claim) {
      return NextResponse.json({ message: "Claim not found" }, { status: 404 });
    }

    // Only item owner or admin can approve/reject
    if (claim.item.userId !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (action === "APPROVE") {
      // Approve this claim
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: "APPROVED" }
      });

      // Reject all other pending claims for this item
      await prisma.claim.updateMany({
        where: { itemId: claim.itemId, id: { not: claimId }, status: "PENDING" },
        data: { status: "REJECTED" }
      });

      // Mark item as RECOVERED
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: "RECOVERED" }
      });

      // Notify claimant
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: "CLAIM",
          content: `Your claim for "${claim.item.title}" has been APPROVED! Please check messages for pickup details.`,
          link: `/dashboard`
        }
      });

    } else if (action === "REJECT") {
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: "REJECTED" }
      });
      
      // If no other pending claims, revert item status
      const remainingPending = await prisma.claim.count({
        where: { itemId: claim.itemId, status: "PENDING" }
      });
      
      if (remainingPending === 0) {
        await prisma.item.update({
          where: { id: claim.itemId },
          data: { status: "ACTIVE" }
        });
      }
      
      // Notify claimant
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: "CLAIM",
          content: `Your claim for "${claim.item.title}" was rejected.`,
          link: `/dashboard`
        }
      });
    }

    return NextResponse.json({ message: `Claim ${action.toLowerCase()}d successfully` }, { status: 200 });
  } catch (error) {
    console.error("Claim Action API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
