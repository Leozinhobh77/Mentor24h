import { db } from './index';
import { categories, audios, pillarEnum } from './schema';

/**
 * Seed database with initial data
 * Categories (42) + Audios (92) from SPEC
 */

export async function seedCategories() {
  const categoryData = [
    // Organization (12)
    { name: 'Planejamento semanal', pillar: 'organization', order: 1 },
    { name: 'Produtividade', pillar: 'organization', order: 2 },
    { name: 'Gestão de tempo', pillar: 'organization', order: 3 },
    { name: 'Metas e objetivos', pillar: 'organization', order: 4 },
    { name: 'Hábitos', pillar: 'organization', order: 5 },
    { name: 'Rotina matinal', pillar: 'organization', order: 6 },
    { name: 'Rotina noturna', pillar: 'organization', order: 7 },
    { name: 'Leitura', pillar: 'organization', order: 8 },
    { name: 'Tecnologia', pillar: 'organization', order: 9 },
    { name: 'Estudo', pillar: 'organization', order: 10 },
    { name: 'Finanças', pillar: 'organization', order: 11 },
    { name: 'Saúde', pillar: 'organization', order: 12 },

    // Inspiration (10)
    { name: 'Frases motivacionais', pillar: 'inspiration', order: 13 },
    { name: 'Histórias de sucesso', pillar: 'inspiration', order: 14 },
    { name: 'Criatividade', pillar: 'inspiration', order: 15 },
    { name: 'Relacionamentos', pillar: 'inspiration', order: 16 },
    { name: 'Confiança', pillar: 'inspiration', order: 17 },
    { name: 'Autossuperação', pillar: 'inspiration', order: 18 },
    { name: 'Empreendedorismo', pillar: 'inspiration', order: 19 },
    { name: 'Filosofia de vida', pillar: 'inspiration', order: 20 },
    { name: 'Comportamento', pillar: 'inspiration', order: 21 },
    { name: 'Crescimento pessoal', pillar: 'inspiration', order: 22 },

    // Entertainment (10)
    { name: 'Comédia', pillar: 'entertainment', order: 23 },
    { name: 'Curiosidades', pillar: 'entertainment', order: 24 },
    { name: 'Notícias', pillar: 'entertainment', order: 25 },
    { name: 'Poesia', pillar: 'entertainment', order: 26 },
    { name: 'Música', pillar: 'entertainment', order: 27 },
    { name: 'Artes', pillar: 'entertainment', order: 28 },
    { name: 'Cinema', pillar: 'entertainment', order: 29 },
    { name: 'Esportes', pillar: 'entertainment', order: 30 },
    { name: 'Viagens', pillar: 'entertainment', order: 31 },
    { name: 'Gastronomia', pillar: 'entertainment', order: 32 },

    // Wellbeing (10)
    { name: 'Meditação', pillar: 'wellbeing', order: 33 },
    { name: 'Respiração', pillar: 'wellbeing', order: 34 },
    { name: 'Yoga', pillar: 'wellbeing', order: 35 },
    { name: 'Exercícios', pillar: 'wellbeing', order: 36 },
    { name: 'Nutrição', pillar: 'wellbeing', order: 37 },
    { name: 'Sono', pillar: 'wellbeing', order: 38 },
    { name: 'Saúde mental', pillar: 'wellbeing', order: 39 },
    { name: 'Estresse', pillar: 'wellbeing', order: 40 },
    { name: 'Ansiedade', pillar: 'wellbeing', order: 41 },
    { name: 'Depressão', pillar: 'wellbeing', order: 42 },
  ];

  console.log('🌱 Seeding 42 categories...');

  for (const cat of categoryData) {
    await db.insert(categories).values({
      name: cat.name,
      pillar: cat.pillar as any,
      order: cat.order,
    }).onConflictDoNothing();
  }

  console.log('✅ Categories seeded');
}

export async function seedAudios() {
  // Simplified audio seed (92 audios)
  // In production, these would come from a CMS or storage service

  const audioCategories = [
    { category: 'Meditação', count: 20 },
    { category: 'Respiração', count: 8 },
    { category: 'Prayers', count: 15 },
    { category: 'Stories', count: 12 },
    { category: 'Motivation', count: 10 },
    { category: 'Exercises', count: 8 },
    { category: 'Inspirational', count: 6 },
    { category: 'Comedy', count: 8 },
    { category: 'Affirmations', count: 5 },
  ];

  console.log('🎵 Seeding 92 audios...');

  // This is a simplified version - in production, you'd load from a CSV or API
  // For now, we're just creating the structure

  console.log('✅ Audio structure ready (load from external source)');
}

export async function main() {
  try {
    console.log('🌱 Starting database seed...');
    await seedCategories();
    // await seedAudios(); // Would need actual audio URLs
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
