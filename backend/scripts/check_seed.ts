import prisma from "../src/services/prismaClient";

async function main() {
  const count = await prisma.scholarship.count();
  const rows = await prisma.scholarship.findMany({
    take: 5,
    select: { name: true, provider: true, sector: true },
  });

  console.log(`COUNT=${count}`);
  console.log(`SAMPLE=${JSON.stringify(rows)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
