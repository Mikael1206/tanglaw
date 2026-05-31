import prisma from "../src/services/prismaClient";

async function main(){
  const data = await prisma.scholarship.findMany({ select: { id: true, name: true, provider: true, sector: true, incomeBracket: true } });
  console.log('count', data.length);
  console.log(data);
  await prisma.$disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });
