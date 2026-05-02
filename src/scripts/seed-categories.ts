import { seedCategories } from '../lib/db/seed';

/**
 * Seed script for categories
 * Run: npm run seed:categories
 */

async function main() {
  try {
    console.log('🌱 Starting category seed...');
    await seedCategories();
    console.log('✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
