import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const botNames = [
  'Merjen_07', 'Aşyr_Türkmen', 'Lala_92', 'Nazar_55',
  'Gülşat_11', 'Döwlet_88', 'Jeren_33', 'Serdar_44',
  'Mähri_22', 'Yusup_77', 'Ayna_99', 'Begenç_66',
];

async function main() {
  console.log('🌱 Seeding bot users...');

  for (const name of botNames) {
    await prisma.user.upsert({
      where: { username: name },
      update: {},
      create: {
        username: name,
        isBot: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      },
    });
    console.log(`✅ Created bot: ${name}`);
  }

  // Create an admin bot user for scheduled posts
  await prisma.user.upsert({
    where: { username: 'pikirler_admin' },
    update: {},
    create: {
      username: 'pikirler_admin',
      isBot: true,
      isAdmin: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  console.log('✅ Admin bot created: pikirler_admin');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
