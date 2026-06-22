import { prisma } from '@/lib/db';

type Model = 'like' | 'save' | 'repost';

type Delegate = {
  findUnique: (a: unknown) => Promise<{ id: string } | null>;
  delete: (a: unknown) => Promise<unknown>;
  create: (a: unknown) => Promise<unknown>;
  count: (a: unknown) => Promise<number>;
};

/** Toggle a (postId,userId) row on a model; returns { active, count }. */
export async function toggle(model: Model, postId: string, userId: string) {
  const delegate = (prisma as unknown as Record<Model, Delegate>)[model];
  const existing = await delegate.findUnique({ where: { postId_userId: { postId, userId } } });
  let active: boolean;
  if (existing) {
    await delegate.delete({ where: { id: existing.id } });
    active = false;
  } else {
    await delegate.create({ data: { postId, userId } });
    active = true;
  }
  const count = await delegate.count({ where: { postId } });
  return { active, count };
}
