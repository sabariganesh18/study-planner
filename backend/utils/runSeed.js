const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runSeed() {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root';
  const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

  console.log('[Seed] Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true
  });

  const schemaSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf-8');
  const seedSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'seed.sql'), 'utf-8');

  console.log('[Seed] Executing schema.sql...');
  await conn.query(schemaSql);

  console.log('[Seed] Executing seed.sql...');
  await conn.query(seedSql);

  console.log('[Seed] Database seeded successfully!');
  await conn.end();
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
