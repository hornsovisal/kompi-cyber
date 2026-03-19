const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || process.env.YOUR_DB_HOST || process.env.TEAM_DB_HOST || 'localhost',
  port: process.env.DB_PORT || process.env.YOUR_DB_PORT || process.env.TEAM_DB_PORT || 3306,
  user: process.env.DB_USER || process.env.YOUR_DB_USER || process.env.TEAM_DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.YOUR_DB_PASSWORD || process.env.TEAM_DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.YOUR_DB_NAME || process.env.TEAM_DB_NAME || 'kompi_cyber',
  multipleStatements: true,
};

async function run() {
  const schemaFile = path.resolve(__dirname, '../database/schema.sql');
  const seedFile = path.resolve(__dirname, '../database/seed.sql');

  console.log('Using DB config:', { host: config.host, port: config.port, user: config.user, database: config.database });

  const serverConn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  });

  await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Database ensured: ${config.database}`);
  await serverConn.end();

  const db = await mysql.createConnection(config);

  const schema = fs.readFileSync(schemaFile, 'utf8');
  console.log('Importing schema...');
  await db.query(schema);

  const seed = fs.readFileSync(seedFile, 'utf8');
  console.log('Importing seed data...');
  await db.query(seed);

  await db.end();

  console.log('Database setup complete!');
}

run().catch((err) => {
  console.error('Failed to setup database:', err.message || err);
  process.exit(1);
});
