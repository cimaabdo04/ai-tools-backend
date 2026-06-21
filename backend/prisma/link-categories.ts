import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tools = await prisma.tool.findMany();
  const categories = await prisma.category.findMany();

  const catMap = new Map(categories.map(c => [c.slug, c.id]));
  const toolMap = new Map(tools.map(t => [t.slug, t.id]));

  const links: { slug: string; catSlugs: string[] }[] = [
    { slug: 'chatgpt',      catSlugs: ['text-writing', 'code-development'] },
    { slug: 'midjourney',   catSlugs: ['image-generation'] },
    { slug: 'github-copilot', catSlugs: ['code-development'] },
    { slug: 'runway-ml',    catSlugs: ['video'] },
    { slug: 'dalle-3',      catSlugs: ['image-generation'] },
    { slug: 'deepseek',     catSlugs: ['research-analysis'] },
    { slug: 'canva-ai',     catSlugs: ['design-art'] },
    { slug: 'perplexity',   catSlugs: ['research-analysis'] },
    { slug: 'notion-ai',    catSlugs: ['productivity'] },
    { slug: 'jasper-ai',    catSlugs: ['marketing-sales'] },
  ];

  for (const { slug, catSlugs } of links) {
    const toolId = toolMap.get(slug);
    if (!toolId) { console.log(`❌ Tool not found: ${slug}`); continue; }
    for (const catSlug of catSlugs) {
      const catId = catMap.get(catSlug);
      if (!catId) { console.log(`❌ Category not found: ${catSlug}`); continue; }
      await prisma.toolCategory.upsert({
        where: { toolId_categoryId: { toolId, categoryId: catId } },
        update: {},
        create: { toolId, categoryId: catId },
      });
      console.log(`✓ ${slug} → ${catSlug}`);
    }
  }

  // Update toolCount for all categories
  for (const cat of categories) {
    const count = await prisma.toolCategory.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { toolCount: count } });
  }

  console.log('✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
