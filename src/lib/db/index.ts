import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Initialize database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Create postgres connection
const client = postgres(connectionString, {
  max: 10,
  ssl: true,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other parts of the app
export * from './schema';
