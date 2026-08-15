const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbName = process.env.PGDATABASE || 'motorola_laptop_service';

async function init() {
  console.log('Initializing database...');

  const db = require('./db');

  // If Supabase is configured, use Supabase initialization flow
  if (db.isSupabase) {
    console.log('⚡ Using Supabase client connection.');
    try {
      console.log('Checking if repairs table is created in Supabase...');
      const checkRepairs = await db.query('SELECT COUNT(*) FROM repairs');
      
      const count = parseInt(checkRepairs.rows[0].count);
      console.log(`repairs table verified. Current record count: ${count}`);

      if (count === 0) {
        console.log('Inserting seed repair record for testing...');
        const seedTicket = 'MOTO-8302';
        await db.query(
          `INSERT INTO repairs (ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [seedTicket, 'Motorola', 'Moto Edge 50 Ultra', 'Broken display glass and back cover replacement.', 'Yash Sharma', 'yash.sharma@example.com', '8795427739', 'Walk-in', 'Diagnosis']
        );
        console.log(`✅ Seed record created successfully. Ticket ID: ${seedTicket}`);
      } else {
        console.log('Database tables already seeded. Skipping seed record.');
      }
      
      console.log('🎉 Supabase initialization check completed successfully!');
    } catch (err) {
      if (err.code === '42P01' || err.code === 'PGRST205' || (err.message && (err.message.includes('does not exist') || err.message.includes('schema cache')))) {
        console.error('\n❌ ERROR: Supabase tables do not exist yet.');
        console.error('👉 Action Required:');
        console.error('   1. Open your Supabase Dashboard SQL Editor.');
        console.error(`   2. Copy the contents of the backend/schema.sql file.`);
        console.error('   3. Run the SQL query to create the tables.');
        console.error('   4. Run this script (node db-init.js) again to insert seed data.\n');
      } else {
        console.error('❌ Error testing connection or inserting seed record on Supabase:', err);
      }
      process.exit(1);
    } finally {
      await db.pool.end();
      console.log('Init script completed.');
    }
    return;
  }

  // --- Legacy PostgreSQL initialization flow (runs if Supabase is not configured) ---
  console.log('⚡ Using standard PostgreSQL connection.');
  const connectionString = process.env.DATABASE_URL;
  let masterConfig;

  if (connectionString) {
    masterConfig = {
      connectionString: connectionString.replace(/\/[^/]+$/, '/postgres'),
    };
  } else {
    masterConfig = {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432'),
      database: 'postgres',
    };
  }

  const client = new Client(masterConfig);
  let dbCreated = false;

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully.`);
      dbCreated = true;
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.warn(`Could not check/create database from standard 'postgres' database. We will try to connect to the target database directly. Details: ${err.message}`);
  } finally {
    try {
      await client.end();
    } catch (e) { }
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema.sql...');
    await db.query(schemaSql);
    console.log('Database tables and indexes verified/created successfully!');

    // Insert a sample record if table is empty
    const checkRepairs = await db.query('SELECT COUNT(*) FROM repairs');
    if (parseInt(checkRepairs.rows[0].count) === 0) {
      console.log('Inserting seed repair record for testing...');
      const seedTicket = 'MOTO-8302';
      await db.query(
        `INSERT INTO repairs (ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [seedTicket, 'Motorola', 'Moto Edge 50 Ultra', 'Broken display glass and back cover replacement.', 'Yash Sharma', 'yash.sharma@example.com', '8795427739', 'Walk-in', 'Diagnosis']
      );
      console.log(`Seed record created. Ticket ID: ${seedTicket}`);
    }
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  } finally {
    await db.pool.end();
    console.log('Database connection pool closed. Init script completed.');
  }
}

init();
