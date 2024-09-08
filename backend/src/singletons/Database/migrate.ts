import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '.';

const migration = async () => {
  await migrate(db, {
    migrationsFolder: './src/singletons/Database/migrations/drizzle',
  });
};

migration()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  });
