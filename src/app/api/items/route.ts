import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findMatchesForItem } from "@/lib/matching";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const locationName = formData.get("locationName") as string || ""; // Optional now
    const campusId = formData.get("campusId") as string;
    const buildingId = formData.get("buildingId") as string;
    const floorId = formData.get("floorId") as string;
    const areaId = formData.get("areaId") as string;
    const reward = formData.get("reward") as string;
    const contactPref = formData.get("contactPref") as string;
    const distinguishingFeatures = formData.get("distinguishingFeatures") as string;
    const currentPossession = formData.get("currentPossession") as string;
    const imageFile = formData.get("image") as File | null;
    const idCardImage = formData.get("idCardImage") as File | null;

    if (!type || !category || !title || !description || !date || !locationName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (!idCardImage || !idCardImage.name) {
      return NextResponse.json({ message: "ID Card photo is required for security verification" }, { status: 400 });
    }

    // Get the user's collegeId
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { collegeId: true }
    });
    
    if (!user || !user.collegeId) {
      return NextResponse.json({ message: "User not assigned to a college" }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && imageFile.name) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = imageFile.type || 'image/jpeg';
      imageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    let idCardImageUrl = null;
    if (idCardImage && idCardImage.name) {
      const bytes = await idCardImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = idCardImage.type || 'image/jpeg';
      idCardImageUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    const itemData: any = {
      type,
      category,
      title,
      description,
      date: new Date(date),
      time,
      locationName,
      collegeId: user.collegeId,
      campusId,
      buildingId,
      floorId,
      areaId,
      reward,
      contactPref,
      distinguishingFeatures,
      currentPossession,
      idCardImageUrl,
      userId: (session.user as any).id,
    };

    if (imageUrl) {
      itemData.images = {
        create: [{ url: imageUrl }]
      };
    }

    const item = await prisma.item.create({
      data: itemData,
    });

    // Fire-and-forget matching engine trigger
    findMatchesForItem(item.id).catch(console.error);

    return NextResponse.json({ message: "Item reported successfully", itemId: item.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
