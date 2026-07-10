const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.PGDATABASE || 'motorola_laptop_service';

async function init() {
  console.log('Initializing database...');

  // 1. Try to create the database if it doesn't exist
  // We connect to standard 'postgres' db first to run CREATE DATABASE
  const connectionString = process.env.DATABASE_URL;
  let masterConfig;

  if (connectionString) {
    // If connection string is provided, try to extract host/port/credentials and connect to standard postgres first
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
      // CREATE DATABASE cannot be executed inside a transaction block, pg handles it
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
    } catch (e) {}
  }

  // 2. Connect to the target database and apply schema
  const db = require('./db');
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
        [seedTicket, 'Motorola', 'Moto Edge 50 Ultra', 'Broken display glass and back cover replacement.', 'Yash Sharma', 'yash.sharma@example.com', '9876543210', 'Walk-in', 'Diagnosis']
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
