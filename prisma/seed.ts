import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOTS = [
  'Merjen_07', 'Aşyr_Türkmen', 'Lala_92', 'Nazar_55', 'Gülşat_11', 'Döwlet_88',
  'Jeren_33', 'Serdar_44', 'Mähri_22', 'Yusup_77', 'Ayna_99', 'Begenç_66',
];

const SAMPLE_POSTS = [
  'Türkmenistanda täze ýol açyldy! Siz näme pikir edýärsiňiz? #TäzeMähri #Türkmenistan',
  'Meniň iň gowy dostum Aşgabatda ýaşaýar. Gowy günler! #Dostluk',
  'Saglyk üçin sport etmek gerek. Her gün 30 minut ýöremek ýeterlik. #Sagdynlyk',
  'Türkmen dilini öwrenmek aňsatmy? Mende kynçylyklar bar. #TürkmenDili',
  'Aşgabat şäheri gaty owadan. Bu ýerde ýaşamak bagt! #Aşgabat',
];

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

async function main() {
  // admin bot
  const admin = await prisma.user.upsert({
    where: { username: 'pikirler_admin' },
    update: {},
    create: { username: 'pikirler_admin', isBot: true, isAdmin: true, avatar: avatar('pikirler_admin') },
  });

  // bot users
  const bots = [];
  for (const username of BOTS) {
    const b = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, isBot: true, avatar: avatar(username) },
    });
    bots.push(b);
  }
  console.log(`Seeded ${bots.length} bots + admin`);

  // sample posts (only if feed is empty, to stay idempotent-ish)
  const count = await prisma.post.count();
  if (count === 0) {
    for (let i = 0; i < SAMPLE_POSTS.length; i++) {
      const author = i === 0 ? admin : bots[i % bots.length];
      await prisma.post.create({
        data: { text: SAMPLE_POSTS[i], images: [], userId: author.id },
      });
    }
    console.log(`Seeded ${SAMPLE_POSTS.length} sample posts`);
  } else {
    console.log(`Skipped sample posts (${count} already exist)`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
