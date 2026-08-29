import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Fix SQLite path resolution for the adapter
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });
const bcrypt = require('bcrypt');

async function main() {
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

  // 1. Create College
  const college = await prisma.college.create({
    data: {
      name: 'ABC University',
      code: 'ABC001',
      description: 'A premium institution for higher education.',
    },
  });

  // 2. Create Campus
  const campus = await prisma.campus.create({
    data: {
      name: 'Main Campus',
      collegeId: college.id,
    },
  });

  // 3. Create Buildings
  const libraryBuilding = await prisma.building.create({
    data: { name: 'Library', type: 'Library', campusId: campus.id },
  });
  
  const cseBuilding = await prisma.building.create({
    data: { name: 'CSE Block', type: 'Academic Block', campusId: campus.id },
  });

  const canteenBuilding = await prisma.building.create({
    data: { name: 'Canteen', type: 'Cafeteria', campusId: campus.id },
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
      collegeId: college.id,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Jones',
      email: 'bob@example.com',
      passwordHash,
      role: 'USER',
      collegeId: college.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      collegeId: college.id,
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
      collegeId: college.id,
      campusId: campus.id,
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
      collegeId: college.id,
      campusId: campus.id,
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

  console.log('Database seeded with College structures successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
