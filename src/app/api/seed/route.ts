import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    console.log('Seeding database with College structure...');

    // Clean up existing data
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.match.deleteMany();
    await prisma.itemImage.deleteMany();
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();
    
    // Clean up location data
    await prisma.area.deleteMany();
    await prisma.floor.deleteMany();
    await prisma.building.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.college.deleteMany();

    // 1. Create Colleges
    const collegeABC = await prisma.college.create({
      data: { name: 'ABC University', code: 'ABC001', description: 'A premium institution for higher education.' },
    });

    const collegeAU = await prisma.college.create({
      data: { name: 'Andhra University', code: 'AU001', description: 'Public university located in Visakhapatnam, Andhra Pradesh.' },
    });

    const collegeKLU = await prisma.college.create({
      data: { name: 'KL University', code: 'KLU001', description: 'Deemed university in Guntur, Andhra Pradesh.' },
    });

    const collegeOU = await prisma.college.create({
      data: { name: 'Osmania University', code: 'OU001', description: 'Public state university in Hyderabad, Telangana.' },
    });

    const collegeIIITH = await prisma.college.create({
      data: { name: 'IIIT Hyderabad', code: 'IIITH001', description: 'International Institute of Information Technology, Hyderabad.' },
    });

    // 2. Create Campuses
    const campusABC = await prisma.campus.create({
      data: { name: 'Main Campus', collegeId: collegeABC.id },
    });

    const campusAU = await prisma.campus.create({
      data: { name: 'South Campus', collegeId: collegeAU.id },
    });

    const campusKLU = await prisma.campus.create({
      data: { name: 'Green Fields Campus', collegeId: collegeKLU.id },
    });

    const campusOU = await prisma.campus.create({
      data: { name: 'Main Campus', collegeId: collegeOU.id },
    });

    const campusIIITH = await prisma.campus.create({
      data: { name: 'Gachibowli Campus', collegeId: collegeIIITH.id },
    });

    // 3. Create Buildings
    const libraryBuilding = await prisma.building.create({
      data: { name: 'Library', type: 'Library', campusId: campusABC.id },
    });
    
    const cseBuilding = await prisma.building.create({
      data: { name: 'CSE Block', type: 'Academic Block', campusId: campusABC.id },
    });

    const canteenBuilding = await prisma.building.create({
      data: { name: 'Canteen', type: 'Cafeteria', campusId: campusABC.id },
    });

    // 4. Create Floors and Areas for Library
    const libGroundFloor = await prisma.floor.create({
      data: { name: 'Ground Floor', buildingId: libraryBuilding.id },
    });
    
    const libFirstFloor = await prisma.floor.create({
      data: { name: '1st Floor', buildingId: libraryBuilding.id },
    });

    const readingRoom = await prisma.area.create({
      data: { name: 'Reading Room', type: 'Study Area', floorId: libGroundFloor.id },
    });
    
    const referenceSection = await prisma.area.create({
      data: { name: 'Reference Section', type: 'Study Area', floorId: libFirstFloor.id },
    });

    // Create Floors and Areas for CSE Block
    const cseSecondFloor = await prisma.floor.create({
      data: { name: '2nd Floor', buildingId: cseBuilding.id },
    });

    const lab204 = await prisma.area.create({
      data: { name: 'Lab 204', type: 'Laboratory', floorId: cseSecondFloor.id },
    });

    // 5. Create users assigned to the college
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const alice = await prisma.user.create({
      data: {
        name: 'Alice Smith',
        email: 'alice@example.com',
        passwordHash,
        role: 'USER',
        collegeId: collegeABC.id,
      },
    });

    const bob = await prisma.user.create({
      data: {
        name: 'Bob Jones',
        email: 'bob@example.com',
        passwordHash,
        role: 'USER',
        collegeId: collegeABC.id,
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: 'ADMIN',
        collegeId: collegeABC.id,
      },
    });

    // 6. Create items mapped to the new structured locations
    const lostItem = await prisma.item.create({
      data: {
        type: 'LOST',
        title: 'Brown Leather Wallet',
        description: 'Lost my brown leather Tommy Hilfiger wallet. It has my ID and a few credit cards inside.',
        category: 'Wallet',
        date: new Date('2026-08-20T12:00:00Z'),
        locationName: 'Reading Room, Ground Floor, Library', // Legacy text
        collegeId: collegeABC.id,
        campusId: campusABC.id,
        buildingId: libraryBuilding.id,
        floorId: libGroundFloor.id,
        areaId: readingRoom.id,
        status: 'ACTIVE',
        userId: alice.id,
      },
    });

    const foundItem = await prisma.item.create({
      data: {
        type: 'FOUND',
        title: 'Found Brown Wallet',
        description: 'Found a brown leather wallet on a desk. Contains some cards.',
        category: 'Wallet',
        date: new Date('2026-08-21T09:00:00Z'),
        locationName: 'Reading Room, Library',
        collegeId: collegeABC.id,
        campusId: campusABC.id,
        buildingId: libraryBuilding.id,
        floorId: libGroundFloor.id,
        areaId: readingRoom.id,
        status: 'ACTIVE',
        userId: bob.id,
        currentPossession: 'Handed to library reception',
      },
    });

    // 7. Create a match
    await prisma.match.create({
      data: {
        lostItemId: lostItem.id,
        foundItemId: foundItem.id,
        score: 95,
        reasons: 'Same category, Exact Area match, Close dates',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
