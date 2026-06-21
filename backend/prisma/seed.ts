import { PrismaClient, UserRole, UserStatus, ToolStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  for (const model of [
    'analyticEvent', 'compareItem', 'affiliateLink', 'banner', 'auditLog',
    'pendingEdit', 'claimRequest', 'report', 'message', 'notification',
    'featuredHistory', 'sponsoredListing', 'collectionTool', 'collection',
    'bookmark', 'review', 'toolTag', 'tag', 'tool', 'category', 'session',
    'apiKey', 'payment', 'subscription', 'pricingPlan', 'blogPost',
    'translation', 'page', 'whiteLabelConfig', 'user'
  ]) {
    await (prisma as any)[model].deleteMany();
  }

  const hash = await bcrypt.hash('TestPass123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      passwordHash: hash,
      name: 'Super Admin',
      username: 'superadmin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hash,
      name: 'Admin User',
      username: 'admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash: hash,
      name: 'John Doe',
      username: 'johndoe',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'vendor@example.com',
      passwordHash: hash,
      name: 'Jane Smith',
      username: 'janesmith',
      role: UserRole.VENDOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const category1 = await prisma.category.create({
    data: { name: 'Image Generation', slug: 'image-generation', description: 'AI tools for generating images', icon: 'image', color: '#6366f1' },
  });

  const category2 = await prisma.category.create({
    data: { name: 'Text & Writing', slug: 'text-writing', description: 'AI writing assistants and text generation', icon: 'pen', color: '#8b5cf6' },
  });

  const category3 = await prisma.category.create({
    data: { name: 'Video', slug: 'video', description: 'AI video generation and editing tools', icon: 'video', color: '#ec4899' },
  });

  const category4 = await prisma.category.create({
    data: { name: 'Code & Development', slug: 'code-development', description: 'AI coding assistants and dev tools', icon: 'code', color: '#10b981' },
  });

  const category5 = await prisma.category.create({
    data: { name: 'Audio & Music', slug: 'audio-music', description: 'AI audio and music generation tools', icon: 'music', color: '#f59e0b' },
  });

  const category6 = await prisma.category.create({
    data: { name: 'Design & Art', slug: 'design-art', description: 'AI tools for design, art, and creative work', icon: 'palette', color: '#ec4899' },
  });

  const category7 = await prisma.category.create({
    data: { name: 'Research & Analysis', slug: 'research-analysis', description: 'AI tools for research, data analysis, and insights', icon: 'search', color: '#f59e0b' },
  });

  const category8 = await prisma.category.create({
    data: { name: 'Productivity', slug: 'productivity', description: 'AI productivity tools and smart assistants', icon: 'zap', color: '#06b6d4' },
  });

  const category9 = await prisma.category.create({
    data: { name: 'Marketing & Sales', slug: 'marketing-sales', description: 'AI tools for marketing, sales, and advertising', icon: 'megaphone', color: '#f43f5e' },
  });

  const category10 = await prisma.category.create({
    data: { name: '3D & Modeling', slug: '3d-modeling', description: 'AI tools for 3D modeling, VR, and architecture', icon: 'cube', color: '#a855f7' },
  });

  const category11 = await prisma.category.create({
    data: { name: 'Education', slug: 'education', description: 'AI tools for learning, teaching, and training', icon: 'book-open', color: '#22c55e' },
  });

  const category12 = await prisma.category.create({
    data: { name: 'E-commerce', slug: 'ecommerce', description: 'AI tools for e-commerce and online stores', icon: 'shopping-cart', color: '#eab308' },
  });

  const category13 = await prisma.category.create({
    data: { name: 'Gaming & Entertainment', slug: 'gaming', description: 'AI tools for gaming, entertainment, and interactive experiences', icon: 'gamepad-2', color: '#6366f1' },
  });

  const categories = [category1, category2, category3, category4, category5, category6, category7, category8, category9, category10, category11, category12, category13];

  const tag1 = await prisma.tag.create({ data: { name: 'مجاني', slug: 'free', categoryId: category1.id } });
  const tag2 = await prisma.tag.create({ data: { name: 'مدفوع', slug: 'premium', categoryId: category2.id } });
  const tag3 = await prisma.tag.create({ data: { name: 'API', slug: 'api', categoryId: category4.id } });
  const tag4 = await prisma.tag.create({ data: { name: 'مفتوح المصدر', slug: 'open-source', categoryId: category4.id } });
  const tag5 = await prisma.tag.create({ data: { name: 'تصميم شعارات', slug: 'logo-design', categoryId: category6.id } });
  const tag6 = await prisma.tag.create({ data: { name: 'تصميم واجهات', slug: 'ui-ux-design', categoryId: category6.id } });
  const tag7 = await prisma.tag.create({ data: { name: 'بحث ويب', slug: 'web-search', categoryId: category7.id } });
  const tag8 = await prisma.tag.create({ data: { name: 'تحليل بيانات', slug: 'data-analysis', categoryId: category7.id } });
  const tag9 = await prisma.tag.create({ data: { name: 'إدارة مهام', slug: 'task-management', categoryId: category8.id } });
  const tag10 = await prisma.tag.create({ data: { name: 'مساعد ذكي', slug: 'smart-assistant', categoryId: category8.id } });
  const tag11 = await prisma.tag.create({ data: { name: 'سوشيال ميديا', slug: 'social-media', categoryId: category9.id } });
  const tag12 = await prisma.tag.create({ data: { name: 'إعلانات', slug: 'ad-copy', categoryId: category9.id } });
  const tag13 = await prisma.tag.create({ data: { name: 'إنشاء ثلاثي الأبعاد', slug: '3d-creation', categoryId: category10.id } });
  const tag14 = await prisma.tag.create({ data: { name: 'نص إلى 3D', slug: 'text-to-3d', categoryId: category10.id } });
  const tag15 = await prisma.tag.create({ data: { name: 'تعلم لغات', slug: 'language-learning', categoryId: category11.id } });
  const tag16 = await prisma.tag.create({ data: { name: 'إنشاء دورات', slug: 'course-creation', categoryId: category11.id } });
  const tag17 = await prisma.tag.create({ data: { name: 'وصف منتجات', slug: 'product-description', categoryId: category12.id } });
  const tag18 = await prisma.tag.create({ data: { name: 'تحليل سوق', slug: 'market-analysis', categoryId: category12.id } });
  const tag19 = await prisma.tag.create({ data: { name: 'دردشة ذكية', slug: 'ai-chat', categoryId: category13.id } });
  const tag20 = await prisma.tag.create({ data: { name: 'قصص تفاعلية', slug: 'story-games', categoryId: category13.id } });
  const tag21 = await prisma.tag.create({ data: { name: 'موشن جرافيك', slug: 'motion-graphics', categoryId: category3.id } });
  const tag22 = await prisma.tag.create({ data: { name: 'مونتاج فيديو', slug: 'video-editing', categoryId: category3.id } });
  const tag23 = await prisma.tag.create({ data: { name: 'نص إلى كلام', slug: 'text-to-speech', categoryId: category5.id } });
  const tag24 = await prisma.tag.create({ data: { name: 'توليد موسيقى', slug: 'music-generation', categoryId: category5.id } });
  const tag25 = await prisma.tag.create({ data: { name: 'وكيل ذكي', slug: 'ai-agent', categoryId: category8.id } });
  const tag26 = await prisma.tag.create({ data: { name: 'محادثة آلية', slug: 'chatbot', categoryId: category9.id } });
  const tag27 = await prisma.tag.create({ data: { name: 'كتابة محتوى', slug: 'copywriting', categoryId: category2.id } });
  const tag28 = await prisma.tag.create({ data: { name: 'تحرير صور', slug: 'image-editing', categoryId: category1.id } });
  const tag29 = await prisma.tag.create({ data: { name: 'مراجعة كود', slug: 'code-review', categoryId: category4.id } });
  const tag30 = await prisma.tag.create({ data: { name: 'توليد فيديو', slug: 'video-generation', categoryId: category3.id } });
  const tag31 = await prisma.tag.create({ data: { name: 'تصور بيانات', slug: 'data-visualization', categoryId: category7.id } });
  const tag32 = await prisma.tag.create({ data: { name: 'توليد صور', slug: 'photo-generation', categoryId: category1.id } });

  const toolData = [
    { name: 'ChatGPT', slug: 'chatgpt', tagline: 'Advanced AI language model by OpenAI', description: 'ChatGPT is a conversational AI model developed by OpenAI. It can answer questions, generate content, and assist with various tasks.', websiteUrl: 'https://chat.openai.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Natural language understanding', 'Content generation', 'Code assistance', 'Multi-language support'], useCases: ['Content creation', 'Customer support', 'Education', 'Programming'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category2.id, category4.id], country: 'US', version: 'GPT-5', releases: JSON.stringify([{ version: 'GPT-5', date: '2026-04-15', description: 'Major upgrade with enhanced reasoning, multimodal capabilities, and improved coding performance.' }, { version: 'GPT-4.5', date: '2025-09-01', description: 'Improved accuracy and faster response times across all tasks.' }]) },
    { name: 'Midjourney', slug: 'midjourney', tagline: 'AI art generator for stunning visuals', description: 'Midjourney is an AI-powered image generation tool that creates stunning artwork from text descriptions.', websiteUrl: 'https://midjourney.com', pricingTypes: ['paid'], pricingMin: 10, pricingMax: 60, features: ['Text-to-image generation', 'Style customization', 'High resolution output', 'Community gallery'], useCases: ['Digital art', 'Marketing visuals', 'Concept design', 'Social media'], platforms: ['Web', 'Discord'], openSource: false, categoryIds: [category1.id, category6.id], country: 'US', version: 'v7', releases: JSON.stringify([{ version: 'v7', date: '2026-03-10', description: 'Next-gen image generation with unprecedented realism and style control.' }]) },
    { name: 'GitHub Copilot', slug: 'github-copilot', tagline: 'AI pair programmer for developers', description: 'GitHub Copilot is an AI coding assistant that helps developers write better code faster.', websiteUrl: 'https://github.com/features/copilot', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 10, features: ['Code completion', 'Multi-language support', 'Context-aware suggestions', 'IDE integration'], useCases: ['Software development', 'Code review', 'Learning', 'Prototyping'], platforms: ['VS Code', 'JetBrains', 'Neovim'], openSource: false, categoryIds: [category4.id], country: 'US', version: 'v1.5', releases: JSON.stringify([{ version: 'v1.5', date: '2026-02-20', description: 'Enhanced agent mode with deeper codebase understanding and multi-file editing.' }]) },
    { name: 'Runway ML', slug: 'runway-ml', tagline: 'AI video editing and generation platform', description: 'Runway ML is a creative suite powered by AI for video editing, generation, and visual effects.', websiteUrl: 'https://runwayml.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 75, features: ['Video generation', 'Motion tracking', 'Green screen', 'Text-to-video'], useCases: ['Video production', 'Content creation', 'Visual effects', 'Advertising'], platforms: ['Web', 'iOS'], openSource: false, categoryIds: [category3.id, category1.id], country: 'US', version: 'Gen-4', releases: JSON.stringify([{ version: 'Gen-4', date: '2026-01-15', description: 'Real-time video generation with cinematic quality and precise motion control.' }]) },
    { name: 'DALL-E 3', slug: 'dalle-3', tagline: 'OpenAI text-to-image generation', description: 'DALL-E 3 is OpenAI latest image generation model with unprecedented accuracy.', websiteUrl: 'https://openai.com/dall-e-3', pricingTypes: ['paid'], pricingMin: 0, pricingMax: 0, features: ['Text-to-image', 'Image editing', 'Style transfer', 'High quality output'], useCases: ['Design', 'Marketing', 'Art', 'Education'], platforms: ['Web'], openSource: false, categoryIds: [category1.id, category6.id], country: 'US', version: 'v3' },
    { name: 'DeepSeek', slug: 'deepseek', tagline: 'Advanced AI model by Deep Seek', description: 'DeepSeek is an advanced AI model offering powerful reasoning and coding capabilities.', websiteUrl: 'https://deepseek.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 10, features: ['Reasoning', 'Coding', 'Multi-language'], useCases: ['Programming', 'Analysis', 'Research'], platforms: ['Web', 'API'], openSource: true, categoryIds: [category4.id], country: 'CN', version: 'R1', releases: JSON.stringify([{ version: 'R1', date: '2026-01-20', description: 'Open-source reasoning model with breakthrough performance on math and coding benchmarks.' }, { version: 'V3', date: '2025-12-01', description: 'Mixture-of-Experts architecture with superior cost-efficiency.' }]) },
    { name: 'Canva AI', slug: 'canva-ai', tagline: 'AI-powered design platform', description: 'Canva AI brings powerful design capabilities with AI-powered features including magic design, background removal, and smart suggestions.', websiteUrl: 'https://canva.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 12.99, features: ['Magic design', 'Background removal', 'Smart suggestions', 'Brand kits'], useCases: ['Social media', 'Presentations', 'Print design', 'Branding'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category6.id, category9.id], country: 'AU', version: 'Pro' },
    { name: 'Perplexity AI', slug: 'perplexity', tagline: 'AI-powered research assistant', description: 'Perplexity AI is an advanced research and answer engine that provides comprehensive, cited answers to complex questions.', websiteUrl: 'https://perplexity.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Web search', 'Cited answers', 'Deep research', 'File analysis'], useCases: ['Research', 'Writing', 'Analysis', 'Learning'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category7.id, category2.id], country: 'US', version: 'Pro' },
    { name: 'Notion AI', slug: 'notion-ai', tagline: 'AI-powered workspace for productivity', description: 'Notion AI integrates artificial intelligence directly into your workspace for writing, brainstorming, summarizing, and organizing.', websiteUrl: 'https://notion.so', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 10, features: ['AI writing', 'Summarization', 'Project management', 'Knowledge base'], useCases: ['Project planning', 'Documentation', 'Team collaboration', 'Note taking'], platforms: ['Web', 'iOS', 'Android', 'macOS', 'Windows'], openSource: false, categoryIds: [category8.id, category2.id], country: 'US', version: 'AI' },
    { name: 'Jasper AI', slug: 'jasper-ai', tagline: 'AI marketing and content platform', description: 'Jasper is an AI content platform designed for marketers to create on-brand content faster.', websiteUrl: 'https://jasper.ai', pricingTypes: ['paid'], pricingMin: 39, pricingMax: 69, features: ['Brand voice', 'Content generation', 'SEO optimization', 'Campaign management'], useCases: ['Ad copy', 'Blog posts', 'Social media', 'Email marketing'], platforms: ['Web'], openSource: false, categoryIds: [category9.id, category2.id], country: 'US', version: 'Business' },
    { name: 'Spline AI', slug: 'spline-ai', tagline: 'AI for 3D design and modeling', description: 'Spline AI enables designers to create 3D objects and scenes using natural language prompts and AI assistance.', websiteUrl: 'https://spline.design', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 15, features: ['Text to 3D', 'AI generation', 'Real-time collaboration', 'Web-based editor'], useCases: ['3D design', 'Prototyping', 'Game assets', 'Product visualization'], platforms: ['Web'], openSource: false, categoryIds: [category10.id, category6.id], country: 'US', version: 'Alpha' },
    { name: 'Duolingo Max', slug: 'duolingo-max', tagline: 'AI-powered language learning', description: 'Duolingo Max uses GPT-4 to power advanced learning features including roleplay and explain-my-answer for language learners.', websiteUrl: 'https://duolingo.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 13.99, features: ['AI roleplay', 'Explain my answer', 'Personalized learning', 'Gamification'], useCases: ['Language learning', 'Education', 'Test preparation', 'Travel'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category11.id], country: 'US', version: 'Max' },
    { name: 'Shopify Magic', slug: 'shopify-magic', tagline: 'AI for e-commerce merchants', description: 'Shopify Magic is a suite of AI-powered features that help merchants create product descriptions, generate images, and optimize their store.', websiteUrl: 'https://shopify.com/magic', pricingTypes: ['paid'], pricingMin: 29, pricingMax: 299, features: ['Product descriptions', 'Image generation', 'Email campaigns', 'Chat responses'], useCases: ['Product listings', 'Customer service', 'Email marketing', 'Store optimization'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category12.id, category9.id], country: 'CA', version: 'Magic' },
    { name: 'Character AI', slug: 'character-ai', tagline: 'AI-powered character chat experiences', description: 'Character AI lets users create and interact with AI-powered characters for entertainment, learning, and creative storytelling.', websiteUrl: 'https://character.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 9.99, features: ['Character creation', 'Voice chat', 'Group chats', 'Story mode'], useCases: ['Entertainment', 'Creative writing', 'Roleplay', 'Learning'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category13.id, category11.id], country: 'US', version: 'c.ai+' },
    { name: 'Claude', slug: 'claude', tagline: 'Advanced AI assistant by Anthropic', description: 'Claude is Anthropic most advanced AI assistant, excelling at complex reasoning, coding, analysis, and thoughtful conversation.', websiteUrl: 'https://claude.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Complex reasoning', 'Code generation', 'Long context', 'Safety-focused'], useCases: ['Programming', 'Analysis', 'Writing', 'Research'], platforms: ['Web', 'iOS', 'API'], openSource: false, categoryIds: [category2.id, category4.id], country: 'US', version: 'Claude 4' },
    { name: 'Synthesia', slug: 'synthesia', tagline: 'AI video generation with AI avatars', description: 'Synthesia lets you create professional videos with AI avatars in minutes without cameras or actors.', websiteUrl: 'https://synthesia.io', pricingTypes: ['paid'], pricingMin: 29, pricingMax: 89, features: ['AI avatars', 'Text to video', 'Multi-language', 'Templates'], useCases: ['Corporate training', 'Marketing videos', 'Explainer videos', 'Presentations'], platforms: ['Web'], openSource: false, categoryIds: [category3.id], country: 'GB', version: 'Enterprise' },
    { name: 'ElevenLabs', slug: 'elevenlabs', tagline: 'AI voice synthesis and text-to-speech', description: 'ElevenLabs offers the most realistic AI voice synthesis with emotion, intonation, and multi-language support.', websiteUrl: 'https://elevenlabs.io', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 22, features: ['Text to speech', 'Voice cloning', 'Speech to speech', 'Multi-language'], useCases: ['Content creation', 'Audiobooks', 'Dubbing', 'Voiceovers'], platforms: ['Web', 'iOS', 'API'], openSource: false, categoryIds: [category5.id], country: 'US', version: 'v2' },
    { name: 'Adobe Firefly', slug: 'adobe-firefly', tagline: 'Generative AI for creative design', description: 'Adobe Firefly is a family of creative generative AI models integrated into Adobe creative cloud applications.', websiteUrl: 'https://firefly.adobe.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 54.99, features: ['Text to image', 'Generative fill', 'Text effects', 'Vector generation'], useCases: ['Design', 'Photo editing', 'Marketing', 'Digital art'], platforms: ['Web', 'Desktop'], openSource: false, categoryIds: [category1.id, category6.id], country: 'US', version: 'Firefly 3' },
    { name: 'Grammarly', slug: 'grammarly', tagline: 'AI writing assistant for polished content', description: 'Grammarly is an AI-powered writing assistant that helps you write clearly, concisely, and confidently across all your apps.', websiteUrl: 'https://grammarly.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 12, features: ['Grammar check', 'Style suggestions', 'Tone detection', 'Plagiarism check'], useCases: ['Writing', 'Email', 'Professional comms', 'Academic'], platforms: ['Web', 'iOS', 'Android', 'Desktop', 'Browser extension'], openSource: false, categoryIds: [category2.id, category8.id], country: 'US', version: 'Premium' },
    { name: 'Otter AI', slug: 'otter-ai', tagline: 'AI meeting assistant and transcription', description: 'Otter AI provides real-time transcription, meeting notes, and action items for your meetings and conversations.', websiteUrl: 'https://otter.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Real-time transcription', 'Meeting notes', 'Action items', 'Search transcripts'], useCases: ['Meetings', 'Interviews', 'Lectures', 'Collaboration'], platforms: ['Web', 'iOS', 'Android', 'Zoom integration'], openSource: false, categoryIds: [category8.id, category7.id], country: 'US', version: 'Pro' },
    { name: 'HubSpot AI', slug: 'hubspot-ai', tagline: 'AI for marketing, sales, and service', description: 'HubSpot AI brings intelligent automation to your CRM with content generation, predictive analytics, and smart chatbots.', websiteUrl: 'https://hubspot.com/products/ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 90, features: ['Content assistant', 'Smart chatbots', 'Predictive analytics', 'Email automation'], useCases: ['Sales', 'Marketing', 'Customer service', 'Lead generation'], platforms: ['Web'], openSource: false, categoryIds: [category9.id], country: 'US', version: 'Enterprise' },
    { name: 'Ideogram', slug: 'ideogram', tagline: 'AI image generation with text rendering', description: 'Ideogram is an AI image generation tool that excels at rendering text within images, making it perfect for logos and designs.', websiteUrl: 'https://ideogram.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 20, features: ['Text rendering', 'Image generation', 'Style control', 'High resolution'], useCases: ['Logo design', 'Posters', 'Social media', 'Presentations'], platforms: ['Web'], openSource: false, categoryIds: [category1.id, category6.id], country: 'US', version: 'v2' },
    { name: 'Pictory', slug: 'pictory', tagline: 'AI video creation from text and scripts', description: 'Pictory transforms your blog posts, scripts, and articles into engaging videos automatically using AI.', websiteUrl: 'https://pictory.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 39, features: ['Script to video', 'Auto captioning', 'Video summaries', 'Brand templates'], useCases: ['Content marketing', 'Blog to video', 'Social media', 'Training'], platforms: ['Web'], openSource: false, categoryIds: [category3.id], country: 'US', version: 'Premium' },
    { name: 'Soundraw', slug: 'soundraw', tagline: 'AI music generation for creators', description: 'Soundraw is an AI music generator that lets you create royalty-free music by choosing the genre, mood, and length.', websiteUrl: 'https://soundraw.io', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 16.99, features: ['Music generation', 'Genre selection', 'Mood filters', 'Royalty-free'], useCases: ['Background music', 'Content creation', 'Podcasts', 'Video production'], platforms: ['Web'], openSource: false, categoryIds: [category5.id], country: 'US', version: 'Pro' },
    { name: 'Autodesk AI', slug: 'autodesk-ai', tagline: 'AI-powered 3D design and architecture', description: 'Autodesk integrates AI into its design tools for generative design, parametric modeling, and intelligent 3D workflows.', websiteUrl: 'https://autodesk.com/ai', pricingTypes: ['paid'], pricingMin: 50, pricingMax: 300, features: ['Generative design', 'Parametric modeling', 'Simulation', 'Rendering'], useCases: ['Architecture', 'Product design', 'Engineering', 'Construction'], platforms: ['Desktop'], openSource: false, categoryIds: [category10.id], country: 'US', version: 'Forma' },
    { name: 'Khan Academy Khanmigo', slug: 'khanmigo', tagline: 'AI tutor for personalized learning', description: 'Khanmigo is Khan Academy AI-powered tutor that guides students with questions instead of giving answers.', websiteUrl: 'https://khanacademy.org/khanmigo', pricingTypes: ['paid'], pricingMin: 9, pricingMax: 9, features: ['Socratic tutoring', 'Personalized learning', 'Subject coverage', 'Progress tracking'], useCases: ['Homework help', 'Test prep', 'Self-study', 'Tutoring'], platforms: ['Web'], openSource: false, categoryIds: [category11.id], country: 'US', version: 'Tutor' },
    { name: 'ZMO AI', slug: 'zmo-ai', tagline: 'AI for e-commerce product content', description: 'ZMO AI helps e-commerce merchants create professional product images, descriptions, and marketing materials using AI.', websiteUrl: 'https://zmo.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 49, features: ['Product image generation', 'Background removal', 'Product descriptions', 'Model generation'], useCases: ['Product photography', 'Product listings', 'Catalog creation', 'Marketing'], platforms: ['Web'], openSource: false, categoryIds: [category12.id, category9.id], country: 'US', version: 'Studio' },
    { name: 'AI Dungeon', slug: 'ai-dungeon', tagline: 'AI-powered interactive storytelling', description: 'AI Dungeon is an AI-driven text adventure game that creates infinite interactive stories based on your choices.', websiteUrl: 'https://aidungeon.com', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 15, features: ['Interactive stories', 'Custom scenarios', 'Multiplayer', 'Image generation'], useCases: ['Gaming', 'Storytelling', 'Creative writing', 'Entertainment'], platforms: ['Web', 'iOS', 'Android'], openSource: false, categoryIds: [category13.id], country: 'US', version: 'Premium' },
    { name: 'Murf AI', slug: 'murf-ai', tagline: 'AI voice generator for professional content', description: 'Murf AI offers realistic AI voices for podcasts, videos, presentations, and e-learning content with studio-quality output.', websiteUrl: 'https://murf.ai', pricingTypes: ['free', 'paid'], pricingMin: 0, pricingMax: 26, features: ['Text to speech', 'Voice customization', 'Multi-language', 'SSML support'], useCases: ['Podcasts', 'E-learning', 'Presentations', 'Voiceovers'], platforms: ['Web', 'API'], openSource: false, categoryIds: [category5.id, category3.id], country: 'US', version: 'Studio' },
  ];

  const tools = [];
  for (const data of toolData) {
    const { categoryIds, features, useCases, platforms, country, version, releases, ...rest } = data;
    const tool = await prisma.tool.create({
      data: {
        ...rest,
        status: ToolStatus.APPROVED,
        isFeatured: true,
        isVerified: true,
        averageRating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        bookmarkCount: Math.floor(Math.random() * 5000) + 500,
        viewCount: Math.floor(Math.random() * 100000) + 10000,
        clickCount: Math.floor(Math.random() * 10000) + 1000,
        pricingTypes: JSON.stringify(rest.pricingTypes),
        features: JSON.stringify(features),
        useCases: JSON.stringify(useCases),
        platforms: JSON.stringify(platforms),
        country,
        version,
        releases,
        authorId: user1.id,
        publishedAt: new Date(),
        toolCategories: {
          create: categoryIds.map((categoryId: string) => ({ categoryId })),
        },
      },
    });
    tools.push(tool);
  }

  const toolTagMap: { toolIndex: number; tagIds: string[] }[] = [
    { toolIndex: 0, tagIds: [tag2.id, tag3.id, tag10.id] },   // ChatGPT → Premium, API, Smart Assistant
    { toolIndex: 1, tagIds: [tag1.id, tag5.id, tag6.id] },   // Midjourney → Free, Logo Design, UI/UX
    { toolIndex: 2, tagIds: [tag3.id, tag4.id] },             // GitHub Copilot → API, Open Source
    { toolIndex: 3, tagIds: [tag1.id] },                       // Runway ML → Free
    { toolIndex: 4, tagIds: [tag1.id, tag6.id] },             // DALL-E 3 → Free, UI/UX
    { toolIndex: 5, tagIds: [tag3.id, tag4.id] },             // DeepSeek → API, Open Source
    { toolIndex: 6, tagIds: [tag5.id, tag6.id, tag11.id] },   // Canva AI → Logo, UI/UX, Social Media
    { toolIndex: 7, tagIds: [tag7.id, tag8.id] },             // Perplexity → Web Search, Data Analysis
    { toolIndex: 8, tagIds: [tag9.id, tag10.id] },            // Notion AI → Task Mgmt, Smart Assistant
    { toolIndex: 9, tagIds: [tag11.id, tag12.id] },           // Jasper AI → Social Media, Ad Copy
    { toolIndex: 10, tagIds: [tag13.id, tag14.id] },          // Spline AI → 3D Creation, Text to 3D
    { toolIndex: 11, tagIds: [tag15.id, tag16.id] },          // Duolingo Max → Language, Course
    { toolIndex: 12, tagIds: [tag17.id, tag18.id] },          // Shopify Magic → Product Desc, Market
    { toolIndex: 13, tagIds: [tag19.id, tag20.id] },          // Character AI → AI Chat, Story Games
    { toolIndex: 14, tagIds: [tag2.id, tag3.id, tag10.id] }, // Claude → Premium, API, Smart Assistant
    { toolIndex: 15, tagIds: [tag1.id, tag21.id] },           // Synthesia → Free, Motion Graphics
    { toolIndex: 16, tagIds: [tag1.id, tag2.id, tag23.id] }, // ElevenLabs → Free, Premium, Text to Speech
    { toolIndex: 17, tagIds: [tag5.id, tag6.id] },            // Adobe Firefly → Logo Design, UI/UX
    { toolIndex: 18, tagIds: [tag10.id, tag25.id, tag27.id] },// Grammarly → Smart Assistant, AI Agent, Copywriting
    { toolIndex: 19, tagIds: [tag7.id, tag8.id, tag9.id] },   // Otter AI → Web Search, Data Analysis, Task Mgmt
    { toolIndex: 20, tagIds: [tag11.id, tag12.id, tag26.id] },// HubSpot AI → Social Media, Ad Copy, Chatbot
    { toolIndex: 21, tagIds: [tag1.id, tag32.id] },            // Ideogram → Free, Photo Generation
    { toolIndex: 22, tagIds: [tag1.id, tag22.id] },            // Pictory → Free, Video Editing
    { toolIndex: 23, tagIds: [tag1.id, tag24.id] },            // Soundraw → Free, Music Generation
    { toolIndex: 24, tagIds: [tag13.id] },                     // Autodesk AI → 3D Creation
    { toolIndex: 25, tagIds: [tag15.id, tag16.id] },           // Khanmigo → Language Learning, Course Creation
    { toolIndex: 26, tagIds: [tag17.id, tag18.id, tag32.id] },// ZMO AI → Product Desc, Market Analysis, Photo Gen
    { toolIndex: 27, tagIds: [tag19.id, tag20.id] },           // AI Dungeon → AI Chat, Story Games
    { toolIndex: 28, tagIds: [tag23.id, tag2.id, tag22.id] }, // Murf AI → Text to Speech, Premium, Video Editing
  ];

  for (const { toolIndex, tagIds } of toolTagMap) {
    for (const tagId of tagIds) {
      await prisma.toolTag.create({
        data: { toolId: tools[toolIndex].id, tagId },
      });
    }
  }

  await prisma.pricingPlan.createMany({
    data: [
      { name: 'Free', slug: 'free', description: 'Perfect for getting started', monthlyPrice: 0, yearlyPrice: 0, features: JSON.stringify(['Browse tools', 'Basic search', 'Save bookmarks (3)', 'Public collections (1)']), isActive: true, sortOrder: 1 },
      { name: 'Starter', slug: 'starter', description: 'For regular users', monthlyPrice: 9.99, yearlyPrice: 99.99, features: JSON.stringify(['Everything in Free', 'Unlimited bookmarks', 'Unlimited collections', 'Advanced search filters', 'Email notifications', 'API access (1K/day)']), isActive: true, isPopular: false, sortOrder: 2 },
      { name: 'Pro', slug: 'pro', description: 'For power users & vendors', monthlyPrice: 29.99, yearlyPrice: 299.99, features: JSON.stringify(['Everything in Starter', 'Submit tools', 'Sponsor listings', 'Analytics dashboard', 'API access (10K/day)', 'Priority support', 'Bulk import tools']), isActive: true, isPopular: true, sortOrder: 3 },
      { name: 'Enterprise', slug: 'enterprise', description: 'For businesses & platforms', monthlyPrice: 99.99, yearlyPrice: 999.99, features: JSON.stringify(['Everything in Pro', 'White-label branding', 'Custom domain', 'Dedicated support', 'Unlimited API access', 'Custom integrations', 'SLA guarantee']), isActive: true, isPopular: false, sortOrder: 4 },
    ],
  });

  await prisma.page.create({
    data: {
      title: 'About Us',
      slug: 'about',
      content: JSON.stringify({ blocks: [{ type: 'heading', text: 'About AI Tools Directory' }, { type: 'paragraph', text: 'We are the largest directory of AI tools on the internet.' }] }),
      published: true,
    },
  });

  // Seed Arabic blog posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'أفضل 10 أدوات ذكاء اصطناعي لإنشاء المحتوى في 2025',
        slug: 'افضل-10-ادوات-ذكاء-اصطناعي-انشاء-محتوى-2025',
        excerpt: 'اكتشف أفضل أدوات الذكاء الاصطناعي لإنشاء المحتوى التي تساعدك على كتابة وتصميم وإنتاج المحتوى بشكل أسرع.',
        content: '<h2>1. ChatGPT - المساعد الذكي الشامل</h2><p>يُعد ChatGPT من OpenAI نموذج لغة متعدد الاستخدامات يمكنه المساعدة في الكتابة والعصف الذهني والتعديل. أصبح أداة أساسية لصناع المحتوى.</p><h2>2. Midjourney - توليد الصور</h2><p>Midjourney هو مولد صور بالذكاء الاصطناعي ينشئ صورًا مذهلة من أوصاف نصية.</p><h2>3. Canva AI - التصميم للجميع</h2><p>يقدم Canva ميزات ذكاء اصطناعي قوية تشمل التصميم التلقائي وإزالة الخلفيات.</p><h2>4. Claude - محادثة ذكية</h2><p>يُعرف Claude بدقة معلوماته العالية وأقل ميلاً لإنتاج معلومات خاطئة.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-06-19'),
        tags: JSON.stringify(['كتابة', 'محتوى', 'ذكاء اصطناعي', 'أدوات']),
        locale: 'ar',
        viewCount: 1520,
      },
      {
        title: 'كيف يُغير الذكاء الاصطناعي تطوير البرمجيات',
        slug: 'كيف-الذكاء-الاصطناعي-يغير-تطوير-البرمجيات',
        excerpt: 'من توليد الكود إلى اكتشاف الأخطاء، أدوات الذكاء الاصطناعي تُحدث ثورة في طريقة بناء البرمجيات.',
        content: '<h2>توليد الكود</h2><p>أدوات مثل GitHub Copilot وDeepSeek يمكنها توليد الكود من وصف اللغة الطبيعية.</p><h2>اكتشاف الأخطاء</h2><p>أدوات الاختبار المدعومة بالذكاء الاصطناعي يمكنها إيجاد الأخطاء تلقائيًا.</p><h2>مراجعة الكود</h2><p>يمكن للذكاء الاصطناعي مراجعة طلبات السحب واقتراح التحسينات.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-06-15'),
        tags: JSON.stringify(['برمجة', 'أدوات تطوير', 'ذكاء اصطناعي']),
        locale: 'ar',
        viewCount: 890,
      },
      {
        title: 'دليل شامل لنماذج تسعير أدوات الذكاء الاصطناعي',
        slug: 'دليل-شامل-نماذج-تسعير-ادوات-الذكاء-الاصطناعي',
        excerpt: 'فهم نماذج التسعير المختلفة لأدوات الذكاء الاصطناعي لاتخاذ قرارات مستنيرة.',
        content: '<h2>النموذج المجاني (Freemium)</h2><p>تقدم العديد من أدوات الذكاء الاصطناعي مستوى مجاني بميزات محدودة.</p><h2>الاشتراك</h2><p>تتقاضى معظم أدوات الذكاء الاصطناعي رسوم اشتراك شهرية أو سنوية.</p><h2>الدفع حسب الاستخدام</h2><p>تتقاضى بعض الأدوات رسومًا بناءً على الاستخدام مثل استدعاءات API.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-06-10'),
        tags: JSON.stringify(['تسعير', 'مقارنة', 'دليل']),
        locale: 'ar',
        viewCount: 720,
      },
      {
        title: 'مقارنة: ChatGPT vs Claude vs Gemini في 2025',
        slug: 'مقارنة-chatgpt-vs-claude-vs-gemini-2025',
        excerpt: 'نقارن بين أقوى 3 نماذج ذكاء اصطناعي للمحادثة.',
        content: '<h2>دقة المعلومات</h2><p>ChatGPT ممتاز في المهام الإبداعية. Claude يُعرف بدقة معلوماته العالية. Gemini يتفوق في البحث.</p><h2>الدعم البرمجي</h2><p>ChatGPT ممتاز مع Code Interpreter. Claude يتفوق في شرح الكود. Gemini يتكامل مع VS Code.</p><h2>الخلاصة</h2><p>الاختيار يعتمد على احتياجاتك: ChatGPT للمحتوى، Claude للتحليل، Gemini للتكامل.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-06-05'),
        tags: JSON.stringify(['مقارنة', 'ChatGPT', 'Claude', 'مراجعة']),
        locale: 'ar',
        viewCount: 1100,
      },
      {
        title: 'أدوات الذكاء الاصطناعي المجانية للطلاب',
        slug: 'ادوات-ذكاء-اصطناعي-مجانية-للطلاب',
        excerpt: 'اكتشف أقوى أدوات الذكاء الاصطناعي المجانية التي تساعد الطلاب في الدراسة.',
        content: '<h2>ChatGPT</h2><p>لشرح المفاهيم الصعبة وحل المسائل الرياضية.</p><h2>DeepSeek</h2><p>مفتوح المصدر ومجاني، ممتاز في الرياضيات والفيزياء.</p><h2>Canva AI</h2><p>تصميم العروض التقديمية بسهولة.</p><h2>Notion AI</h2><p>تلخيص الملاحظات وإنشاء جداول دراسية.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-05-28'),
        tags: JSON.stringify(['تعليم', 'طلاب', 'أدوات مجانية']),
        locale: 'ar',
        viewCount: 680,
      },
      {
        title: 'مستقبل التسويق بالذكاء الاصطناعي: اتجاهات 2025',
        slug: 'مستقبل-التسويق-بالذكاء-الاصطناعي-اتجاهات-2025',
        excerpt: 'اكتشف أحدث اتجاهات التسويق بالذكاء الاصطناعي.',
        content: '<h2>التسويق الشخصي الفوري</h2><p>يُمكّن الذكاء الاصطناعي من إنشاء محتوى مخصص لكل عميل.</p><h2>إنشاء المحتوى الآلي</h2><p>توليد محتوى عالي الجودة بسرعة.</p><h2>روبوتات المحادثة المتقدمة</h2><p>تجربة عملاء استثنائية على مدار الساعة.</p>',
        authorId: admin.id,
        authorName: 'فريق المدونة',
        published: true,
        publishedAt: new Date('2025-05-20'),
        tags: JSON.stringify(['تسويق', 'اتجاهات', 'أعمال']),
        locale: 'ar',
        viewCount: 540,
      },
    ],
  });

  await prisma.translation.createMany({
    data: [
      { key: 'nav.home', locale: 'en', value: 'Home' },
      { key: 'nav.home', locale: 'ar', value: 'الرئيسية' },
      { key: 'nav.discover', locale: 'en', value: 'Discover' },
      { key: 'nav.discover', locale: 'ar', value: 'اكتشف' },
      { key: 'nav.categories', locale: 'en', value: 'Categories' },
      { key: 'nav.categories', locale: 'ar', value: 'التصنيفات' },
      { key: 'nav.pricing', locale: 'en', value: 'Pricing' },
      { key: 'nav.pricing', locale: 'ar', value: 'التسعير' },
      { key: 'hero.title', locale: 'en', value: 'Discover the Best AI Tools' },
      { key: 'hero.title', locale: 'ar', value: 'اكتشف أفضل أدوات الذكاء الاصطناعي' },
      { key: 'hero.subtitle', locale: 'en', value: 'Find, compare, and review the latest AI tools' },
      { key: 'hero.subtitle', locale: 'ar', value: 'ابحث، قارن، وقيم أحدث أدوات الذكاء الاصطناعي' },
      { key: 'common.search', locale: 'en', value: 'Search tools...' },
      { key: 'common.search', locale: 'ar', value: 'ابحث عن أدوات...' },
    ],
  });

  await prisma.whiteLabelConfig.create({
    data: { name: 'AI Tools Directory', primaryColor: '#6366f1', secondaryColor: '#8b5cf6', isActive: true },
  });

  console.log('✅ Database seeded successfully!');
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 superadmin@example.com / TestPass123!');
    console.log('📧 user1@example.com / TestPass123!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
