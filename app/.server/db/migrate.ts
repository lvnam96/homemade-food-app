import { migrate as neonMigrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './index';
import invariant from 'tiny-invariant';
import drizzleConfig from '../../../drizzle.config';

invariant(drizzleConfig.out, 'Output folder must be set when running migration');

const migrationsFolder = drizzleConfig.out;

invariant(process.env.DB_MIGRATING === 'true', 'DB_MIGRATING must be set to true when running migration');

const main = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await neonMigrate(db, { migrationsFolder });
    }
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

main();
