const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    const activity = await prisma.activityLog.create({
      data: {
        userId: user.id,
        category: 'Transport',
        activityDesc: 'Test',
        co2e: 1.5
      }
    });
    console.log('Success:', activity);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
