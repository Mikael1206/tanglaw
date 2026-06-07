require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position"
    );
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('query error', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
