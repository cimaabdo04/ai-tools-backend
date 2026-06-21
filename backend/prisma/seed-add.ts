import { PrismaClient, ToolStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.user.findFirst();
  if (!author) { console.log('❌ No user found. Run seed.ts first.'); return; }

  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c]));

  const tools = [
    // ─── 3D & Modeling (+3) ───
    { name: 'Meshy', slug: 'meshy', tagline: 'AI-powered 3D model generation from text', description: 'Meshy uses AI to generate high-quality 3D models from text descriptions, images, or sketches, ready for games and AR/VR.', websiteUrl: 'https://meshy.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 39, features: ['Text-to-3D', 'Image-to-3D', 'PBR texturing', 'Animation-ready'], useCases: ['Game development', 'VR/AR', 'Product design', 'Architecture'], platforms: ['Web'], openSource: false, categorySlugs: ['3d-modeling'], country: 'US' },
    { name: 'Luma AI', slug: 'luma-ai', tagline: '3D capture and neural rendering', description: 'Luma AI creates photorealistic 3D assets from video captures using neural rendering technology.', websiteUrl: 'https://lumalabs.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 50, features: ['Neural rendering', '3D capture', 'Photorealistic output', 'Web viewer'], useCases: ['Product visualization', 'E-commerce', 'Architecture', 'Film VFX'], platforms: ['Web', 'iOS'], openSource: false, categorySlugs: ['3d-modeling', 'design-art'], country: 'US' },
    { name: 'Kaedim', slug: 'kaedim', tagline: 'AI 3D asset creation for games', description: 'Kaedim converts 2D concept art into production-ready 3D models using AI, saving game developers weeks of manual work.', websiteUrl: 'https://kaedim.com', pricingTypes: ['paid'], pricingMin: 15, pricingMax: 150, features: ['2D-to-3D conversion', 'Game-ready output', 'PBR materials', 'Batch processing'], useCases: ['Game development', 'Concept art to 3D', 'Asset pipeline', 'Indie games'], platforms: ['Web'], openSource: false, categorySlugs: ['3d-modeling', 'gaming'], country: 'GB' },

    // ─── Audio & Music (+3) ───
    { name: 'AIVA', slug: 'aiva', tagline: 'AI music composition for creators', description: 'AIVA composes original music for films, games, and commercials using deep learning trained on classical scores.', websiteUrl: 'https://aiva.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 33, features: ['Music composition', 'Style customization', 'Multi-track export', 'Royalty-free'], useCases: ['Film scoring', 'Game music', 'Commercials', 'Background music'], platforms: ['Web', 'Desktop'], openSource: false, categorySlugs: ['audio-music'], country: 'LU' },
    { name: 'Voicemod', slug: 'voicemod', tagline: 'Real-time AI voice changer', description: 'Voicemod is a real-time voice changer with AI-powered voice filters for gaming, streaming, and content creation.', websiteUrl: 'https://voicemod.net', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Real-time voice changing', 'AI voice filters', 'Soundboard', 'Integration'], useCases: ['Gaming', 'Streaming', 'Content creation', 'Podcasts'], platforms: ['Windows', 'macOS'], openSource: false, categorySlugs: ['audio-music', 'gaming'], country: 'ES' },
    { name: 'Boomy', slug: 'boomy', tagline: 'Create original music with AI in seconds', description: 'Boomy lets anyone create original songs in seconds using AI. Submit your music to streaming platforms and earn royalties.', websiteUrl: 'https://boomy.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 9.99, features: ['Instant song creation', 'Genre selection', 'Vocal generation', 'Streaming distribution'], useCases: ['Music production', 'Content creation', 'Royalty income', 'Background music'], platforms: ['Web'], openSource: false, categorySlugs: ['audio-music', 'productivity'], country: 'US' },

    // ─── Code & Development (+2) ───
    { name: 'Replit AI', slug: 'replit-ai', tagline: 'AI-powered coding environment', description: 'Replit AI is an intelligent coding assistant integrated into the Replit browser IDE, offering code generation, debugging, and deployment.', websiteUrl: 'https://replit.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 25, features: ['AI code generation', 'Debugging assistant', 'Auto-complete', 'Deployment'], useCases: ['Web development', 'Learning to code', 'Prototyping', 'Collaboration'], platforms: ['Web'], openSource: false, categorySlugs: ['code-development', 'education'], country: 'US' },
    { name: 'Tabnine', slug: 'tabnine', tagline: 'AI code completion assistant', description: 'Tabnine is an AI-powered code completion tool that uses deep learning to predict and suggest code in real-time across all IDEs.', websiteUrl: 'https://tabnine.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 39, features: ['Code completion', 'Multi-language', 'IDE integration', 'Team training'], useCases: ['Software development', 'Code quality', 'Productivity', 'DevOps'], platforms: ['VS Code', 'JetBrains', 'Sublime', 'Vim'], openSource: false, categorySlugs: ['code-development', 'productivity'], country: 'IL' },

    // ─── Design & Art (+2) ───
    { name: 'Remove.bg', slug: 'remove-bg', tagline: 'AI background removal for images', description: 'Remove.bg uses AI to automatically remove backgrounds from images with high precision, supporting people, products, and animals.', websiteUrl: 'https://remove.bg', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 9.99, features: ['Background removal', 'Batch processing', 'API access', 'High resolution'], useCases: ['Product photography', 'Profile pictures', 'Design assets', 'E-commerce'], platforms: ['Web', 'API', 'Photoshop plugin'], openSource: false, categorySlugs: ['design-art', 'ecommerce'], country: 'DE' },
    { name: 'Uizard', slug: 'uizard', tagline: 'AI design tool for UI/UX prototyping', description: 'Uizard transforms sketches and screenshots into editable UI designs and prototypes using AI-powered design generation.', websiteUrl: 'https://uizard.io', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 39, features: ['Sketch-to-design', 'Screenshot-to-edit', 'Auto-design', 'Collaboration'], useCases: ['UI/UX design', 'App prototyping', 'Wireframing', 'Product design'], platforms: ['Web'], openSource: false, categorySlugs: ['design-art', 'code-development'], country: 'DK' },

    // ─── E-commerce (+3) ───
    { name: 'Octane AI', slug: 'octane-ai', tagline: 'AI marketing for Shopify stores', description: 'Octane AI provides AI-powered quizzes, personalization, and marketing automation for Shopify merchants.', websiteUrl: 'https://octaneai.com', pricingTypes: ['paid'], pricingMin: 29, pricingMax: 199, features: ['AI quizzes', 'Product recommendations', 'Personalization', 'SMS marketing'], useCases: ['Lead generation', 'Customer personalization', 'Email marketing', 'Sales optimization'], platforms: ['Web', 'Shopify'], openSource: false, categorySlugs: ['ecommerce', 'marketing-sales'], country: 'US' },
    { name: 'Syte', slug: 'syte', tagline: 'Visual AI for product discovery', description: 'Syte uses visual AI to power product discovery, visual search, and personalized recommendations for e-commerce.', websiteUrl: 'https://syte.ai', pricingTypes: ['paid'], pricingMin: 99, pricingMax: 499, features: ['Visual search', 'Product tagging', 'Recommendations', 'Outfit discovery'], useCases: ['Product discovery', 'Visual search', 'Personalization', 'Catalog management'], platforms: ['Web', 'API'], openSource: false, categorySlugs: ['ecommerce'], country: 'IL' },
    { name: 'Vue.ai', slug: 'vue-ai', tagline: 'AI-powered retail intelligence', description: 'Vue.ai automates product tagging, personalization, and visual merchandising for retail and e-commerce businesses.', websiteUrl: 'https://vue.ai', pricingTypes: ['paid'], pricingMin: 199, pricingMax: 999, features: ['Auto product tagging', 'Visual merchandising', 'Personalization', 'Style recommendations'], useCases: ['Retail', 'Catalog management', 'Personalization', 'Visual search'], platforms: ['Web', 'API'], openSource: false, categorySlugs: ['ecommerce', 'design-art'], country: 'IN' },

    // ─── Education (+3) ───
    { name: 'Quizlet Q-Chat', slug: 'quizlet-qchat', tagline: 'AI-powered learning and flashcards', description: 'Quizlet Q-Chat is an AI tutor integrated into Quizlet that helps students learn through interactive flashcards, quizzes, and explanations.', websiteUrl: 'https://quizlet.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 7.99, features: ['AI flashcards', 'Quiz generation', 'Explanations', 'Test prep'], useCases: ['Study', 'Test preparation', 'Self-learning', 'Language learning'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categorySlugs: ['education'], country: 'US' },
    { name: 'Socratic by Google', slug: 'socratic', tagline: 'AI homework helper powered by Google', description: 'Socratic uses AI to help students understand their school work with visual explanations and step-by-step guides.', websiteUrl: 'https://socratic.org', pricingTypes: ['free'], pricingMin: 0, pricingMax: 0, features: ['Homework help', 'Subject coverage', 'Visual explanations', 'Step-by-step guides'], useCases: ['Homework', 'Self-study', 'Test prep', 'Science and math'], platforms: ['iOS', 'Android'], openSource: false, categorySlugs: ['education', 'research-analysis'], country: 'US' },
    { name: 'Cognii', slug: 'cognii', tagline: 'AI tutoring and assessment platform', description: 'Cognii provides AI-powered tutoring, assessment, and feedback for educational institutions and online learning platforms.', websiteUrl: 'https://cognii.com', pricingTypes: ['paid'], pricingMin: 0, pricingMax: 0, features: ['AI tutoring', 'Essay grading', 'Personalized feedback', 'Learning analytics'], useCases: ['Online education', 'Assessment', 'Tutoring', 'Corporate training'], platforms: ['Web', 'API'], openSource: false, categorySlugs: ['education', 'text-writing'], country: 'US' },

    // ─── Gaming (+2) ───
    { name: 'Inworld AI', slug: 'inworld-ai', tagline: 'AI character engine for games', description: 'Inworld AI creates intelligent NPCs with natural language, emotion, and memory for immersive gaming experiences.', websiteUrl: 'https://inworld.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 0, features: ['AI NPCs', 'Natural language', 'Emotional intelligence', 'Memory systems'], useCases: ['Game development', 'NPC creation', 'Interactive fiction', 'Metaverse'], platforms: ['Web', 'Unity', 'Unreal'], openSource: false, categorySlugs: ['gaming', 'code-development'], country: 'US' },
    { name: 'Scenario', slug: 'scenario', tagline: 'AI game asset generation', description: 'Scenario is an AI-powered platform for generating game assets including characters, environments, and textures from text prompts.', websiteUrl: 'https://scenario.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 39, features: ['Asset generation', 'Style consistency', 'Texture generation', 'Character design'], useCases: ['Game art', 'Asset creation', 'Prototyping', 'Indie games'], platforms: ['Web'], openSource: false, categorySlugs: ['gaming', 'design-art'], country: 'US' },

    // ─── Image Generation (+2) ───
    { name: 'Stable Diffusion', slug: 'stable-diffusion', tagline: 'Open-source AI image generation', description: 'Stable Diffusion is a powerful open-source text-to-image model that generates high-quality images from text descriptions.', websiteUrl: 'https://stability.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Text-to-image', 'Inpainting', 'Outpainting', 'Image-to-image'], useCases: ['Digital art', 'Design', 'Photography', 'Research'], platforms: ['Web', 'Desktop', 'API'], openSource: true, categorySlugs: ['image-generation', 'design-art'], country: 'GB' },
    { name: 'Leonardo AI', slug: 'leonardo-ai', tagline: 'AI art and image generation platform', description: 'Leonardo AI is a creative platform for generating high-quality images, game assets, and design concepts with fine-grained control.', websiteUrl: 'https://leonardo.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 30, features: ['Image generation', 'Model training', 'Canvas editor', 'Batch generation'], useCases: ['Concept art', 'Game assets', 'Marketing visuals', 'Product design'], platforms: ['Web'], openSource: false, categorySlugs: ['image-generation', 'marketing-sales'], country: 'AU' },

    // ─── Marketing & Sales (+2) ───
    { name: 'Copy.ai', slug: 'copy-ai', tagline: 'AI copywriting for marketing teams', description: 'Copy.ai uses AI to generate marketing copy, blog posts, social media content, and more with brand-consistent output.', websiteUrl: 'https://copy.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 49, features: ['Content generation', 'Brand voice', 'Workflows', 'Integration'], useCases: ['Ad copy', 'Email marketing', 'Blog writing', 'Social media'], platforms: ['Web', 'API'], openSource: false, categorySlugs: ['marketing-sales', 'text-writing'], country: 'US' },
    { name: 'Writesonic', slug: 'writesonic', tagline: 'AI writer for SEO-optimized content', description: 'Writesonic generates SEO-optimized articles, landing pages, ads, and product descriptions with powerful AI writing capabilities.', websiteUrl: 'https://writesonic.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 19, features: ['SEO optimization', 'Article generation', 'Landing pages', 'Rephrasing'], useCases: ['Content marketing', 'SEO writing', 'Ad copy', 'Email campaigns'], platforms: ['Web'], openSource: false, categorySlugs: ['marketing-sales', 'text-writing'], country: 'US' },

    // ─── Productivity (+2) ───
    { name: 'Motion', slug: 'motion', tagline: 'AI-powered project management', description: 'Motion uses AI to automatically schedule your tasks, optimize your calendar, and manage project timelines efficiently.', websiteUrl: 'https://usemotion.com', pricingTypes: ['paid'], pricingMin: 19, pricingMax: 34, features: ['Smart scheduling', 'Auto task management', 'Calendar optimization', 'Project timelines'], useCases: ['Project management', 'Time management', 'Team scheduling', 'Workflow automation'], platforms: ['Web', 'macOS', 'Windows', 'iOS'], openSource: false, categorySlugs: ['productivity'], country: 'US' },
    { name: 'Mem.ai', slug: 'mem-ai', tagline: 'AI knowledge management and notes', description: 'Mem is an AI-powered knowledge management tool that automatically organizes your notes, connects ideas, and surfaces relevant information.', websiteUrl: 'https://mem.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 14.99, features: ['Auto organization', 'Knowledge graph', 'Smart search', 'AI writing'], useCases: ['Note taking', 'Knowledge management', 'Research', 'Team collaboration'], platforms: ['Web', 'iOS', 'macOS'], openSource: false, categorySlugs: ['productivity', 'research-analysis'], country: 'US' },

    // ─── Research & Analysis (+1) ───
    { name: 'Elicit', slug: 'elicit', tagline: 'AI research assistant for academics', description: 'Elicit helps researchers automate literature review, extract data from papers, and synthesize findings using AI.', websiteUrl: 'https://elicit.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 49, features: ['Literature search', 'Data extraction', 'Paper synthesis', 'Citation management'], useCases: ['Academic research', 'Literature review', 'Data analysis', 'Systematic review'], platforms: ['Web'], openSource: false, categorySlugs: ['research-analysis', 'education'], country: 'US' },

    // ─── Video (+2) ───
    { name: 'HeyGen', slug: 'heygen', tagline: 'AI video generation platform', description: 'HeyGen creates professional videos with AI avatars, voice cloning, and multilingual support for businesses and content creators.', websiteUrl: 'https://heygen.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 48, features: ['AI avatars', 'Video translation', 'Voice cloning', 'Templates'], useCases: ['Corporate videos', 'Marketing', 'Training', 'Personalized video'], platforms: ['Web'], openSource: false, categorySlugs: ['video', 'marketing-sales'], country: 'US' },
    { name: 'Descript', slug: 'descript', tagline: 'AI-powered video and audio editing', description: 'Descript is an all-in-one video and audio editor with AI transcription, text-based editing, screen recording, and collaboration tools.', websiteUrl: 'https://descript.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 30, features: ['Text-based editing', 'AI transcription', 'Screen recording', 'Voice cloning'], useCases: ['Video editing', 'Podcasts', 'Content creation', 'Tutorials'], platforms: ['Web', 'macOS', 'Windows'], openSource: false, categorySlugs: ['video', 'audio-music'], country: 'US' },
  ];

  console.log(`Found ${tools.length} tools to add`);

  let created = 0;
  for (const data of tools) {
    const { categorySlugs, features, useCases, platforms, country, ...rest } = data;

    const existing = await prisma.tool.findUnique({ where: { slug: rest.slug } });
    if (existing) { console.log(`⏭ Skipping ${rest.name} (already exists)`); continue; }

    const tool = await prisma.tool.create({
      data: {
        ...rest,
        status: ToolStatus.APPROVED,
        isFeatured: true,
        isVerified: true,
        averageRating: 4.0 + Math.random() * 0.9,
        reviewCount: Math.floor(Math.random() * 800) + 50,
        bookmarkCount: Math.floor(Math.random() * 3000) + 200,
        viewCount: Math.floor(Math.random() * 80000) + 5000,
        clickCount: Math.floor(Math.random() * 8000) + 500,
        pricingTypes: JSON.stringify(rest.pricingTypes),
        features: JSON.stringify(features),
        useCases: JSON.stringify(useCases),
        platforms: JSON.stringify(platforms),
        country,
        authorId: author.id,
        publishedAt: new Date(),
        toolCategories: {
          create: categorySlugs.map((slug: string) => {
            const cat = catMap.get(slug);
            if (!cat) throw new Error(`Category ${slug} not found`);
            return { categoryId: cat.id };
          }),
        },
      },
    });
    console.log(`✓ Created ${tool.name} → ${categorySlugs.join(', ')}`);
    created++;
  }

  // Update toolCount on all categories
  for (const cat of categories) {
    const count = await prisma.toolCategory.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { toolCount: count } });
    console.log(`📊 ${cat.slug}: ${count} tools`);
  }

  console.log(`\n✅ Done! Created ${created} new tools. Total: ${await prisma.tool.count()} tools.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
