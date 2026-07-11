const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const mockFilePath = path.join(__dirname, 'mock-db.json');

// Initialize mock DB file if it doesn't exist
if (!fs.existsSync(mockFilePath)) {
  fs.writeFileSync(mockFilePath, JSON.stringify({
    repairs: [
      {
        id: 1,
        ticket_id: 'MOTO-8302',
        brand: 'Motorola',
        device_model: 'Moto Edge 50 Ultra',
        issue_description: 'Broken display glass and back cover replacement.',
        customer_name: 'Yash Sharma',
        customer_email: 'yash.sharma@example.com',
        customer_phone: '8795427739',
        service_type: 'Walk-in',
        status: 'Diagnosis',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    contacts: [
      {
        id: 1,
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '9988776655',
        message: 'Do you offer home pickup service in Noida Sector 62 for Dell laptop battery issues?',
        created_at: new Date().toISOString()
      }
    ]
  }, null, 2));
}

let pool;
let useMock = false;

// Create Pool config
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT),
  };

if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

pool = new Pool(poolConfig);

// We will attempt to query once to see if PG is running.
// If it fails, we toggle useMock = true.
let connectionTested = false;
let testPromise = null;

async function testConnection() {
  if (connectionTested) return;
  if (testPromise) return testPromise;

  testPromise = (async () => {
    try {
      // Connect to pool with short timeout
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ PostgreSQL database connected successfully.');
      useMock = false;
    } catch (err) {
      console.warn('\n⚠️  WARNING: PostgreSQL is not reachable using current connection variables.');
      console.warn(`Host tried: ${poolConfig.host || 'localhost'} | Port: ${poolConfig.port || 5432} | Database: ${poolConfig.database || 'motorola_laptop_service'}`);
      console.warn('📁 Falling back to local mock JSON database (backend/mock-db.json) for seamless testing.');
      console.warn('To connect to a real PostgreSQL database, update backend/.env with your PG connection details.\n');
      useMock = true;
    } finally {
      connectionTested = true;
    }
  })();

  return testPromise;
}

// Mock Query implementation
function readMockData() {
  return JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
}

function writeMockData(data) {
  fs.writeFileSync(mockFilePath, JSON.stringify(data, null, 2));
}

async function mockQuery(text, params = []) {
  const data = readMockData();

  // 1. SELECT 1 FROM repairs WHERE ticket_id = $1
  if (text.includes('SELECT 1 FROM repairs WHERE ticket_id = $1')) {
    const ticketId = params[0];
    const found = data.repairs.some(r => r.ticket_id === ticketId);
    return { rows: found ? [{ '1': 1 }] : [], rowCount: found ? 1 : 0 };
  }

  // 2. INSERT INTO repairs
  if (text.includes('INSERT INTO repairs')) {
    const [ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type] = params;
    const newId = data.repairs.length > 0 ? Math.max(...data.repairs.map(r => r.id)) + 1 : 1;
    const newRepair = {
      id: newId,
      ticket_id,
      brand,
      device_model,
      issue_description,
      customer_name,
      customer_email,
      customer_phone,
      service_type,
      status: params[8] || 'Received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.repairs.push(newRepair);
    writeMockData(data);
    return { rows: [newRepair], rowCount: 1 };
  }

  // 3. SELECT * FROM repairs WHERE ticket_id = $1
  if (text.includes('SELECT * FROM repairs WHERE ticket_id = $1')) {
    const ticketId = params[0];
    const found = data.repairs.filter(r => r.ticket_id === ticketId);
    return { rows: found, rowCount: found.length };
  }

  // 4. SELECT * FROM repairs WHERE customer_phone = $1 OR customer_phone LIKE $2
  if (text.includes('customer_phone = $1 OR customer_phone LIKE $2')) {
    const phone = params[0];
    const matches = data.repairs.filter(r =>
      r.customer_phone === phone || r.customer_phone.includes(phone)
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: matches, rowCount: matches.length };
  }

  // 5. INSERT INTO contacts
  if (text.includes('INSERT INTO contacts')) {
    const [name, email, phone, message] = params;
    const newId = data.contacts.length > 0 ? Math.max(...data.contacts.map(c => c.id)) + 1 : 1;
    const newContact = {
      id: newId,
      name,
      email,
      phone,
      message,
      created_at: new Date().toISOString()
    };
    data.contacts.push(newContact);
    writeMockData(data);
    return { rows: [newContact], rowCount: 1 };
  }

  // 6. SELECT * FROM repairs ORDER BY created_at DESC (Admin)
  if (text.includes('SELECT * FROM repairs ORDER BY created_at DESC') || text.includes('SELECT * FROM repairs')) {
    const list = [...data.repairs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list, rowCount: list.length };
  }

  // 7. UPDATE repairs SET status = $1 ... WHERE id = $2
  if (text.includes('UPDATE repairs SET status = $1')) {
    const [status, id] = params;
    const idx = data.repairs.findIndex(r => r.id === parseInt(id));
    if (idx === -1) {
      return { rows: [], rowCount: 0 };
    }
    data.repairs[idx].status = status;
    data.repairs[idx].updated_at = new Date().toISOString();
    writeMockData(data);
    return { rows: [data.repairs[idx]], rowCount: 1 };
  }

  // 8. SELECT * FROM contacts ORDER BY created_at DESC
  if (text.includes('SELECT * FROM contacts ORDER BY created_at DESC') || text.includes('SELECT * FROM contacts')) {
    const list = [...data.contacts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list, rowCount: list.length };
  }

  // Fallback / check count for seed script
  if (text.includes('SELECT COUNT(*) FROM repairs')) {
    return { rows: [{ count: data.repairs.length }], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  query: async (text, params) => {
    await testConnection();
    if (useMock) {
      return mockQuery(text, params);
    } else {
      return pool.query(text, params);
    }
  },
  pool
};
