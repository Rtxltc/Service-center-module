const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const mockFilePath = process.env.VERCEL
  ? path.join('/tmp', 'mock-db.json')
  : path.join(__dirname, 'mock-db.json');

// Initialize mock DB file if it doesn't exist or is missing required tables
let mockData = {
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
  ],
  moto_repairs: [],
  laptop_repairs: [],
  expenses: []
};

if (fs.existsSync(mockFilePath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
    mockData = { ...mockData, ...existing };
  } catch (err) {
    console.error('Error parsing mock database file:', err);
  }
}
fs.writeFileSync(mockFilePath, JSON.stringify(mockData, null, 2));

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

  // --- moto_repairs mock queries ---
  if (text.includes('SELECT * FROM moto_repairs')) {
    const list = [...(data.moto_repairs || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list, rowCount: list.length };
  }

  if (text.includes('INSERT INTO moto_repairs')) {
    const [ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, customer_address, service_type, status, amount_collected, warranty_status, receiving_date, giving_date] = params;
    const newId = data.moto_repairs && data.moto_repairs.length > 0 ? Math.max(...data.moto_repairs.map(r => r.id)) + 1 : 1;
    const newRepair = {
      id: newId,
      ticket_id,
      brand: brand || 'Motorola',
      device_model,
      issue_description: issue_description || '',
      customer_name,
      customer_email: customer_email || '',
      customer_phone,
      customer_address: customer_address || '',
      service_type: service_type || 'Walk-in',
      status: status || 'Received',
      amount_collected: parseFloat(amount_collected || 0),
      warranty_status: warranty_status || 'Out of Warranty',
      receiving_date: receiving_date || new Date().toISOString(),
      giving_date: giving_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!data.moto_repairs) data.moto_repairs = [];
    data.moto_repairs.push(newRepair);
    writeMockData(data);
    return { rows: [newRepair], rowCount: 1 };
  }

  if (text.includes('UPDATE moto_repairs')) {
    const [device_model, issue_description, customer_name, customer_email, customer_phone, customer_address, service_type, status, amount_collected, warranty_status, receiving_date, giving_date, id] = params;
    const idx = data.moto_repairs ? data.moto_repairs.findIndex(r => r.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    data.moto_repairs[idx] = {
      ...data.moto_repairs[idx],
      device_model,
      issue_description,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      service_type,
      status,
      amount_collected: parseFloat(amount_collected || 0),
      warranty_status,
      receiving_date,
      giving_date,
      updated_at: new Date().toISOString()
    };
    writeMockData(data);
    return { rows: [data.moto_repairs[idx]], rowCount: 1 };
  }

  if (text.includes('DELETE FROM moto_repairs')) {
    const id = params[0];
    const idx = data.moto_repairs ? data.moto_repairs.findIndex(r => r.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    const deleted = data.moto_repairs.splice(idx, 1);
    writeMockData(data);
    return { rows: deleted, rowCount: 1 };
  }

  // --- laptop_repairs mock queries ---
  if (text.includes('SELECT * FROM laptop_repairs')) {
    const list = [...(data.laptop_repairs || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list, rowCount: list.length };
  }

  if (text.includes('INSERT INTO laptop_repairs')) {
    const [ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, customer_address, service_type, status, amount_collected, warranty_status, receiving_date, giving_date] = params;
    const newId = data.laptop_repairs && data.laptop_repairs.length > 0 ? Math.max(...data.laptop_repairs.map(r => r.id)) + 1 : 1;
    const newRepair = {
      id: newId,
      ticket_id,
      brand,
      device_model,
      issue_description: issue_description || '',
      customer_name,
      customer_email: customer_email || '',
      customer_phone,
      customer_address: customer_address || '',
      service_type: service_type || 'Walk-in',
      status: status || 'Received',
      amount_collected: parseFloat(amount_collected || 0),
      warranty_status: warranty_status || 'Out of Warranty',
      receiving_date: receiving_date || new Date().toISOString(),
      giving_date: giving_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!data.laptop_repairs) data.laptop_repairs = [];
    data.laptop_repairs.push(newRepair);
    writeMockData(data);
    return { rows: [newRepair], rowCount: 1 };
  }

  if (text.includes('UPDATE laptop_repairs')) {
    const [brand, device_model, issue_description, customer_name, customer_email, customer_phone, customer_address, service_type, status, amount_collected, warranty_status, receiving_date, giving_date, id] = params;
    const idx = data.laptop_repairs ? data.laptop_repairs.findIndex(r => r.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    data.laptop_repairs[idx] = {
      ...data.laptop_repairs[idx],
      brand,
      device_model,
      issue_description,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      service_type,
      status,
      amount_collected: parseFloat(amount_collected || 0),
      warranty_status,
      receiving_date,
      giving_date,
      updated_at: new Date().toISOString()
    };
    writeMockData(data);
    return { rows: [data.laptop_repairs[idx]], rowCount: 1 };
  }

  if (text.includes('DELETE FROM laptop_repairs')) {
    const id = params[0];
    const idx = data.laptop_repairs ? data.laptop_repairs.findIndex(r => r.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    const deleted = data.laptop_repairs.splice(idx, 1);
    writeMockData(data);
    return { rows: deleted, rowCount: 1 };
  }

  // --- expenses mock queries ---
  if (text.includes('SELECT * FROM expenses')) {
    const list = [...(data.expenses || [])].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
    return { rows: list, rowCount: list.length };
  }

  if (text.includes('INSERT INTO expenses')) {
    const [description, amount, expense_date] = params;
    const newId = data.expenses && data.expenses.length > 0 ? Math.max(...data.expenses.map(e => e.id)) + 1 : 1;
    const newExpense = {
      id: newId,
      description,
      amount: parseFloat(amount || 0),
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    if (!data.expenses) data.expenses = [];
    data.expenses.push(newExpense);
    writeMockData(data);
    return { rows: [newExpense], rowCount: 1 };
  }

  if (text.includes('UPDATE expenses')) {
    const [description, amount, expense_date, id] = params;
    const idx = data.expenses ? data.expenses.findIndex(e => e.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    data.expenses[idx] = {
      ...data.expenses[idx],
      description,
      amount: parseFloat(amount || 0),
      expense_date
    };
    writeMockData(data);
    return { rows: [data.expenses[idx]], rowCount: 1 };
  }

  if (text.includes('DELETE FROM expenses')) {
    const id = params[0];
    const idx = data.expenses ? data.expenses.findIndex(e => e.id === parseInt(id)) : -1;
    if (idx === -1) return { rows: [], rowCount: 0 };
    const deleted = data.expenses.splice(idx, 1);
    writeMockData(data);
    return { rows: deleted, rowCount: 1 };
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
