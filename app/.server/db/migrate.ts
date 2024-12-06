import { migrate as neonMigrate } from 'drizzle-orm/neon-http/migrator';
import { migrate as pgMigrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

const main = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await neonMigrate(db as Exclude<typeof db, NodePgDatabase>, { migrationsFolder: 'drizzle' });
    } else {
      await pgMigrate(db as NodePgDatabase, { migrationsFolder: 'drizzle' });
    }
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

main();
