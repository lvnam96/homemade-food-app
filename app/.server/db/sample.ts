import { db } from './instance';

async function main() {
  try {
    const { rows } = await db.execute('SELECT now();');
    // await db.select().from(authorsTable);
    console.log('Sample connection testing completed', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error during sample connection testing:', error);
    process.exit(1);
  }
}

main();
