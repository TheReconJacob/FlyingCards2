import { seedDatabase } from './seedDatabase';

async function main() {
  await seedDatabase();
  console.log('Database seeded successfully');
}

main();