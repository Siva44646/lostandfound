import { prisma } from '../src/lib/prisma';

async function main() {
  const result = await prisma.college.deleteMany({
    where: { name: "ABC University" }
  });
  console.log(`Deleted ${result.count} instances of ABC University.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
