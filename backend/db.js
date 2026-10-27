const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
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

// Initialize Supabase Client if URL and Key are available
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
let useSupabase = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    useSupabase = true;
    console.log('✅ Supabase client initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err);
  }
}

// PostgreSQL setup (fallback/alternative)
let pool = null;
let usePG = false;
let connectionTested = false;
let testPromise = null;

const hasPgConfig = process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD);

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
  };

if (isProduction && poolConfig.connectionString) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

if (useSupabase) {
  // If we are using Supabase, mock the pool object to prevent crashes on pool.end()
  pool = {
    end: async () => {
      console.log('Supabase client session ended (pool no-op).');
    }
  };
} else if (hasPgConfig) {
  pool = new Pool(poolConfig);
}

async function testConnection() {
  if (useSupabase) {
    usePG = false;
    connectionTested = true;
    return;
  }

  if (!hasPgConfig) {
    usePG = false;
    connectionTested = true;
    return;
  }

  if (connectionTested) return;
  if (testPromise) return testPromise;

  testPromise = (async () => {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ PostgreSQL database connected successfully.');
      usePG = true;
    } catch (err) {
      console.warn('\n⚠️  WARNING: PostgreSQL is not reachable using current connection variables.');
      console.warn(`Host tried: ${poolConfig.host || 'localhost'} | Port: ${poolConfig.port || 5432} | Database: ${poolConfig.database || 'motorola_laptop_service'}`);
      console.warn('📁 Falling back to local mock JSON database (backend/mock-db.json) for seamless testing.');
      console.warn('To connect to a real PostgreSQL database, update backend/.env with your PG connection details.\n');
      usePG = false;
    } finally {
      connectionTested = true;
    }
  })();

  return testPromise;
}

// Supabase query mapper implementation
async function supabaseQuery(text, params = []) {
  // Normalize query to simplify matching
  const queryNormalized = text.replace(/\s+/g, ' ').trim();

  if (queryNormalized.includes('SELECT COUNT(*) FROM repairs')) {
    const { data, count, error } = await supabase
      .from('repairs')
      .select('id', { count: 'exact' });
    if (error) throw error;
    return { rows: [{ count: count !== null ? count : (data ? data.length : 0) }], rowCount: 1 };
  }

  // 2. SELECT 1 FROM repairs WHERE ticket_id = $1
  if (queryNormalized.includes('SELECT 1 FROM repairs WHERE ticket_id = $1')) {
    const { data, error } = await supabase
      .from('repairs')
      .select('ticket_id')
      .eq('ticket_id', params[0]);
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 3. INSERT INTO repairs
  if (queryNormalized.includes('INSERT INTO repairs')) {
    const [ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type] = params;
    const { data, error } = await supabase
      .from('repairs')
      .insert([{
        ticket_id,
        brand,
        device_model,
        issue_description,
        customer_name,
        customer_email,
        customer_phone,
        service_type,
        status: params[8] || 'Received'
      }])
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 4. SELECT * FROM repairs WHERE ticket_id = $1
  if (queryNormalized.includes('SELECT * FROM repairs WHERE ticket_id = $1')) {
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .eq('ticket_id', params[0]);
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 5. SELECT * FROM repairs WHERE customer_phone = $1 OR customer_phone LIKE $2
  if (queryNormalized.includes('customer_phone = $1 OR customer_phone LIKE $2') || queryNormalized.includes('customer_phone = $1 OR customer_phone')) {
    const phone = params[0];
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .or(`customer_phone.eq.${phone},customer_phone.ilike.%${phone}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 6. UPDATE repairs SET status = $1 ... WHERE id = $2
  if (queryNormalized.includes('UPDATE repairs SET status = $1') || queryNormalized.includes('UPDATE repairs')) {
    const [status, id] = params;
    const { data, error } = await supabase
      .from('repairs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 7. SELECT * FROM repairs ORDER BY ...
  if (queryNormalized.includes('SELECT * FROM repairs')) {
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 8. INSERT INTO contacts
  if (queryNormalized.includes('INSERT INTO contacts')) {
    const [name, email, phone, message] = params;
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name,
        email,
        phone,
        message
      }])
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // 9. SELECT * FROM contacts
  if (queryNormalized.includes('SELECT * FROM contacts')) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // --- moto_repairs queries ---
  if (queryNormalized.includes('SELECT * FROM moto_repairs')) {
    const { data, error } = await supabase
      .from('moto_repairs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('INSERT INTO moto_repairs')) {
    const [
      ticket_id, brand, device_model, issue_description, customer_name,
      customer_email, customer_phone, customer_address, service_type,
      status, amount_collected, warranty_status, receiving_date, giving_date
    ] = params;

    const { data, error } = await supabase
      .from('moto_repairs')
      .insert([{
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
        giving_date: giving_date || null
      }])
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('UPDATE moto_repairs')) {
    const [
      device_model, issue_description, customer_name, customer_email,
      customer_phone, customer_address, service_type, status,
      amount_collected, warranty_status, receiving_date, giving_date, id
    ] = params;

    const { data, error } = await supabase
      .from('moto_repairs')
      .update({
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
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('DELETE FROM moto_repairs')) {
    const id = params[0];
    const { data, error } = await supabase
      .from('moto_repairs')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // --- laptop_repairs queries ---
  if (queryNormalized.includes('SELECT * FROM laptop_repairs')) {
    const { data, error } = await supabase
      .from('laptop_repairs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('INSERT INTO laptop_repairs')) {
    const [
      ticket_id, brand, device_model, issue_description, customer_name,
      customer_email, customer_phone, customer_address, service_type,
      status, amount_collected, warranty_status, receiving_date, giving_date
    ] = params;

    const { data, error } = await supabase
      .from('laptop_repairs')
      .insert([{
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
        giving_date: giving_date || null
      }])
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('UPDATE laptop_repairs')) {
    const [
      brand, device_model, issue_description, customer_name, customer_email,
      customer_phone, customer_address, service_type, status,
      amount_collected, warranty_status, receiving_date, giving_date, id
    ] = params;

    const { data, error } = await supabase
      .from('laptop_repairs')
      .update({
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
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('DELETE FROM laptop_repairs')) {
    const id = params[0];
    const { data, error } = await supabase
      .from('laptop_repairs')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // --- expenses queries ---
  if (queryNormalized.includes('SELECT * FROM expenses')) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('INSERT INTO expenses')) {
    const [description, amount, expense_date] = params;
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        description,
        amount: parseFloat(amount || 0),
        expense_date: expense_date || new Date().toISOString().split('T')[0]
      }])
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('UPDATE expenses')) {
    const [description, amount, expense_date, id] = params;
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description,
        amount: parseFloat(amount || 0),
        expense_date
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  if (queryNormalized.includes('DELETE FROM expenses')) {
    const id = params[0];
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return { rows: data, rowCount: data ? data.length : 0 };
  }

  // --- Aggregate overview queries ---
  if (queryNormalized.includes('SUM(amount_collected)') && queryNormalized.includes('moto_repairs')) {
    const { data, error } = await supabase
      .from('moto_repairs')
      .select('amount_collected');
    if (error) throw error;
    const total = data ? data.reduce((sum, r) => sum + parseFloat(r.amount_collected || 0), 0) : 0;
    const count = data ? data.length : 0;
    return { rows: [{ total, count }], rowCount: 1 };
  }

  if (queryNormalized.includes('SUM(amount_collected)') && queryNormalized.includes('laptop_repairs')) {
    const { data, error } = await supabase
      .from('laptop_repairs')
      .select('amount_collected');
    if (error) throw error;
    const total = data ? data.reduce((sum, r) => sum + parseFloat(r.amount_collected || 0), 0) : 0;
    const count = data ? data.length : 0;
    return { rows: [{ total, count }], rowCount: 1 };
  }

  if (queryNormalized.includes('SUM(amount)') && queryNormalized.includes('expenses')) {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount');
    if (error) throw error;
    const total = data ? data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) : 0;
    const count = data ? data.length : 0;
    return { rows: [{ total, count }], rowCount: 1 };
  }

  // Unrecognized Supabase query fallback
  console.warn(`⚠️ Warning: Unrecognized Supabase query pattern. Running direct SQL query instead: "${text}"`);
  throw new Error(`Unrecognized SQL query for Supabase client wrapper: ${text}`);
}

// Mock Query implementation (same as original, preserved for safety)
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

const SERVICE_CALL_FIELDS = [
  'soin', 'device_type', 'imei', 'customer_name', 'customer_contact', 'model', 'issue_description',
  'warranty_status', 'call_type', 'part_order_status', 'mail_sent', 'submission_at',
  'relog_due_at', 'quotation_amount', 'submitted_amount', 'payment_method',
  'created_by', 'updated_by'
];

const serviceCallWhere = (filters, values) => {
  const clauses = [];
  const add = (expression, value) => {
    values.push(value);
    clauses.push(expression.replace('?', `$${values.length}`));
  };
  if (filters.dateFrom) add('submission_at >= ?::timestamptz', filters.dateFrom);
  if (filters.dateToExclusive) add('submission_at < ?::timestamptz', filters.dateToExclusive);
  if (filters.warrantyStatus) add('warranty_status = ?', filters.warrantyStatus);
  if (filters.callType) add('call_type = ?', filters.callType);
  if (filters.partOrderStatus) add('part_order_status = ?', filters.partOrderStatus);
  if (filters.mailSent !== undefined) add('mail_sent = ?', filters.mailSent);
  if (filters.tatStatus === 'IN TAT') clauses.push('relog_due_at > CURRENT_TIMESTAMP');
  if (filters.tatStatus === 'TAT Missed') clauses.push('relog_due_at <= CURRENT_TIMESTAMP');
  if (filters.approachingTat) clauses.push("relog_due_at > CURRENT_TIMESTAMP AND relog_due_at <= CURRENT_TIMESTAMP + INTERVAL '6 hours'");
  if (filters.search) {
    values.push(`%${filters.search.replace(/[\\%_]/g, '\\$&')}%`);
    const parameter = `$${values.length}`;
    clauses.push(`(soin ILIKE ${parameter} OR imei ILIKE ${parameter} OR customer_name ILIKE ${parameter} OR customer_contact ILIKE ${parameter} OR model ILIKE ${parameter})`);
  }
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
};

const applySupabaseServiceFilters = (query, filters) => {
  if (filters.dateFrom) query = query.gte('submission_at', filters.dateFrom);
  if (filters.dateToExclusive) query = query.lt('submission_at', filters.dateToExclusive);
  if (filters.warrantyStatus) query = query.eq('warranty_status', filters.warrantyStatus);
  if (filters.callType) query = query.eq('call_type', filters.callType);
  if (filters.partOrderStatus) query = query.eq('part_order_status', filters.partOrderStatus);
  if (filters.mailSent !== undefined) query = query.eq('mail_sent', filters.mailSent);
  if (filters.tatStatus === 'IN TAT') query = query.gt('relog_due_at', new Date().toISOString());
  if (filters.tatStatus === 'TAT Missed') query = query.lte('relog_due_at', new Date().toISOString());
  if (filters.approachingTat) {
    const now = new Date();
    query = query.gt('relog_due_at', now.toISOString())
      .lte('relog_due_at', new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString());
  }
  if (filters.search) {
    const safeSearch = filters.search.replace(/[(),\\%_*]/g, '').trim();
    if (safeSearch) {
      const pattern = `*${safeSearch}*`;
      query = query.or([
        `soin.ilike.${pattern}`,
        `imei.ilike.${pattern}`,
        `customer_name.ilike.${pattern}`,
        `customer_contact.ilike.${pattern}`,
        `model.ilike.${pattern}`
      ].join(','));
    }
  }
  return query;
};

const serviceCalls = {
  async list(filters, { limit, offset, sortBy, sortDirection }) {
    if (useSupabase) {
      const sortField = sortBy === 'soin' ? 'soin' : sortBy === 'relog_due_at' ? 'relog_due_at' : 'submission_at';
      let query = applySupabaseServiceFilters(supabase.from('service_calls').select('*', { count: 'exact' }), filters);
      query = query.order(sortField, { ascending: sortDirection === 'asc' }).range(offset, offset + limit - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      return { rows: data || [], total: count || 0 };
    }

    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const search = (filters.search || '').toLowerCase();
      let rows = (data.service_calls || []).filter(call => {
        const submission = new Date(call.submission_at).getTime();
        const matchesDate = (!filters.dateFrom || submission >= new Date(filters.dateFrom).getTime())
          && (!filters.dateToExclusive || submission < new Date(filters.dateToExclusive).getTime());
        const matchesSearch = !search || [call.soin, call.imei, call.customer_name, call.customer_contact, call.model]
          .some(value => String(value || '').toLowerCase().includes(search));
        const matchesWarranty = !filters.warrantyStatus || call.warranty_status === filters.warrantyStatus;
        const matchesCallType = !filters.callType || call.call_type === filters.callType;
        const matchesParts = !filters.partOrderStatus || call.part_order_status === filters.partOrderStatus;
        const matchesMail = filters.mailSent === undefined || call.mail_sent === filters.mailSent;
        const now = Date.now();
        const due = new Date(call.relog_due_at).getTime();
        const matchesTat = !filters.tatStatus
          || (filters.tatStatus === 'IN TAT' ? due > now : due <= now);
        const matchesApproaching = !filters.approachingTat || (due > now && due <= now + 6 * 60 * 60 * 1000);
        return matchesDate && matchesSearch && matchesWarranty && matchesCallType && matchesParts && matchesMail && matchesTat && matchesApproaching;
      });
      rows.sort((a, b) => {
        const field = sortBy === 'soin' ? 'soin' : sortBy === 'relog_due_at' ? 'relog_due_at' : 'submission_at';
        const result = field === 'soin'
          ? String(a[field]).localeCompare(String(b[field]))
          : new Date(a[field]).getTime() - new Date(b[field]).getTime();
        return sortDirection === 'asc' ? result : -result;
      });
      const total = rows.length;
      rows = rows.slice(offset, offset + limit);
      return { rows, total };
    }

    const values = [];
    const where = serviceCallWhere(filters, values);
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM service_calls ${where}`, values);
    const sortField = sortBy === 'soin' ? 'soin' : sortBy === 'relog_due_at' ? 'relog_due_at' : 'submission_at';
    const pageValues = [...values, limit, offset];
    const result = await pool.query(
      `SELECT * FROM service_calls ${where} ORDER BY ${sortField} ${sortDirection === 'asc' ? 'ASC' : 'DESC'} LIMIT $${pageValues.length - 1} OFFSET $${pageValues.length}`,
      pageValues
    );
    return { rows: result.rows, total: countResult.rows[0].count };
  },

  async all(filters = {}) {
    if (useSupabase) {
      const rows = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        let query = applySupabaseServiceFilters(supabase.from('service_calls').select('*'), filters)
          .order('submission_at', { ascending: false }).range(offset, offset + pageSize - 1);
        const { data, error } = await query;
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < pageSize) break;
      }
      return rows;
    }

    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const search = (filters.search || '').toLowerCase();
      return (data.service_calls || []).filter(call => {
        const submission = new Date(call.submission_at).getTime();
        const now = Date.now();
        const due = new Date(call.relog_due_at).getTime();
        return (!filters.dateFrom || submission >= new Date(filters.dateFrom).getTime())
          && (!filters.dateToExclusive || submission < new Date(filters.dateToExclusive).getTime())
          && (!search || [call.soin, call.imei, call.customer_name, call.customer_contact, call.model]
            .some(value => String(value || '').toLowerCase().includes(search)))
          && (!filters.warrantyStatus || call.warranty_status === filters.warrantyStatus)
          && (!filters.callType || call.call_type === filters.callType)
          && (!filters.partOrderStatus || call.part_order_status === filters.partOrderStatus)
          && (filters.mailSent === undefined || call.mail_sent === filters.mailSent)
          && (!filters.tatStatus || (filters.tatStatus === 'IN TAT' ? due > now : due <= now))
          && (!filters.approachingTat || (due > now && due <= now + 6 * 60 * 60 * 1000));
      });
    }

    const values = [];
    const where = serviceCallWhere(filters, values);
    const result = await pool.query(`SELECT * FROM service_calls ${where} ORDER BY submission_at DESC`, values);
    return result.rows;
  },

  async get(id) {
    if (useSupabase) {
      const { data, error } = await supabase.from('service_calls').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }
    await testConnection();
    if (!usePG) return (readMockData().service_calls || []).find(call => String(call.id) === String(id)) || null;
    const result = await pool.query('SELECT * FROM service_calls WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async claimDueReminders() {
    if (useSupabase) {
      const { data, error } = await supabase.rpc('claim_due_service_call_reminders', { p_limit: 50 });
      if (error) throw error;
      return data || [];
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const now = Date.now();
      const staleClaim = now - 10 * 60 * 1000;
      const claimed = (data.service_calls || []).filter(call => {
        const due = call.reminder_stage === 0
          ? new Date(call.relog_due_at).getTime() <= now
          : call.reminder_stage === 1
            && new Date(call.first_reminder_sent_at).getTime() <= now - 60 * 60 * 1000;
        const claimExpired = !call.reminder_claimed_at
          || new Date(call.reminder_claimed_at).getTime() < staleClaim;
        return due && claimExpired;
      }).slice(0, 50);
      const claimedAt = new Date(now).toISOString();
      claimed.forEach(call => { call.reminder_claimed_at = claimedAt; });
      writeMockData(data);
      return claimed;
    }
    const result = await pool.query('SELECT * FROM claim_due_service_call_reminders($1)', [50]);
    return result.rows;
  },

  async completeReminder(id, cycle, stage, sentAt) {
    const update = {
      reminder_stage: Number(stage) + 1,
      mail_sent: true,
      reminder_claimed_at: null
    };
    if (Number(stage) === 0) update.first_reminder_sent_at = sentAt;
    if (useSupabase) {
      let query = supabase.from('service_calls').update(update)
        .eq('id', id).eq('reminder_cycle', cycle).eq('reminder_stage', stage)
        .not('reminder_claimed_at', 'is', null).select('id');
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return Boolean(data);
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const call = (data.service_calls || []).find(item => String(item.id) === String(id));
      if (!call || Number(call.reminder_cycle || 0) !== Number(cycle)
        || Number(call.reminder_stage || 0) !== Number(stage) || !call.reminder_claimed_at) return false;
      Object.assign(call, update);
      writeMockData(data);
      return true;
    }
    const values = [id, cycle, stage, sentAt];
    const result = await pool.query(
      `UPDATE service_calls
          SET reminder_stage = reminder_stage + 1,
              first_reminder_sent_at = CASE WHEN reminder_stage = 0 THEN $4::timestamptz ELSE first_reminder_sent_at END,
              mail_sent = TRUE,
              reminder_claimed_at = NULL
        WHERE id = $1 AND reminder_cycle = $2 AND reminder_stage = $3
          AND reminder_claimed_at IS NOT NULL
        RETURNING id`,
      values
    );
    return result.rowCount > 0;
  },

  async releaseReminderClaim(id, cycle, stage) {
    if (useSupabase) {
      const { error } = await supabase.from('service_calls').update({ reminder_claimed_at: null })
        .eq('id', id).eq('reminder_cycle', cycle).eq('reminder_stage', stage);
      if (error) throw error;
      return;
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const call = (data.service_calls || []).find(item => String(item.id) === String(id));
      if (call && Number(call.reminder_cycle || 0) === Number(cycle)
        && Number(call.reminder_stage || 0) === Number(stage)) {
        call.reminder_claimed_at = null;
        writeMockData(data);
      }
      return;
    }
    await pool.query(
      'UPDATE service_calls SET reminder_claimed_at = NULL WHERE id = $1 AND reminder_cycle = $2 AND reminder_stage = $3',
      [id, cycle, stage]
    );
  },

  async create(record) {
    if (useSupabase) {
      const { data, error } = await supabase.from('service_calls').insert(record).select().single();
      if (error) throw error;
      return data;
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      data.service_calls = data.service_calls || [];
      if (data.service_calls.some(call => call.soin.toLowerCase() === record.soin.toLowerCase())) {
        const error = new Error('Duplicate SOIN');
        error.code = '23505';
        throw error;
      }
      const now = new Date().toISOString();
      const created = {
        id: data.service_calls.reduce((max, call) => Math.max(max, Number(call.id) || 0), 0) + 1,
        ...record,
        relog_due_at: new Date(new Date(record.submission_at).getTime() + 47 * 60 * 60 * 1000).toISOString(),
        reminder_stage: 0,
        reminder_cycle: 0,
        first_reminder_sent_at: null,
        reminder_claimed_at: null,
        created_at: now,
        updated_at: now
      };
      data.service_calls.push(created);
      writeMockData(data);
      return created;
    }
    const fields = SERVICE_CALL_FIELDS.filter(field => field !== 'relog_due_at');
    const values = fields.map(field => record[field] === undefined ? null : record[field]);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const result = await pool.query(
      `INSERT INTO service_calls (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async update(id, record) {
    if (useSupabase) {
      const { data, error } = await supabase.from('service_calls').update(record).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data;
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      const call = (data.service_calls || []).find(item => String(item.id) === String(id));
      if (!call) return null;
      if (data.service_calls.some(item => item.id !== call.id && item.soin.toLowerCase() === record.soin.toLowerCase())) {
        const error = new Error('Duplicate SOIN');
        error.code = '23505';
        throw error;
      }
      const submissionChanged = new Date(call.submission_at).getTime() !== new Date(record.submission_at).getTime();
      Object.assign(call, record, {
        relog_due_at: new Date(new Date(record.submission_at).getTime() + 47 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
      if (submissionChanged) {
        call.reminder_stage = 0;
        call.reminder_cycle = Number(call.reminder_cycle || 0) + 1;
        call.first_reminder_sent_at = null;
        call.reminder_claimed_at = null;
        call.mail_sent = false;
      }
      writeMockData(data);
      return call;
    }
    const fields = SERVICE_CALL_FIELDS.filter(field => !['soin', 'relog_due_at', 'created_by'].includes(field));
    const values = fields.map(field => record[field] === undefined ? null : record[field]);
    values.push(id);
    const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
    assignments.push('updated_at = CURRENT_TIMESTAMP');
    const result = await pool.query(
      `UPDATE service_calls SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async updateSoin(id, soin, administratorId, reason) {
    if (useSupabase) {
      const { data, error } = await supabase.rpc('update_service_call_soin', {
        p_id: id,
        p_soin: soin,
        p_administrator_id: administratorId,
        p_reason: reason || null
      });
      if (error) throw error;
      return data;
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      data.service_calls = data.service_calls || [];
      data.service_call_soin_history = data.service_call_soin_history || [];
      const call = data.service_calls.find(item => String(item.id) === String(id));
      if (!call) return null;
      if (data.service_calls.some(item => item.id !== call.id && item.soin.toLowerCase() === soin.toLowerCase())) {
        const error = new Error('Duplicate SOIN');
        error.code = '23505';
        throw error;
      }
      const history = {
        id: data.service_call_soin_history.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1,
        service_call_id: call.id,
        previous_soin: call.soin,
        new_soin: soin,
        administrator_id: administratorId,
        changed_at: new Date().toISOString(),
        reason: reason || null
      };
      call.soin = soin;
      call.relog_due_at = new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString();
      call.reminder_stage = 0;
      call.reminder_cycle = Number(call.reminder_cycle || 0) + 1;
      call.first_reminder_sent_at = null;
      call.reminder_claimed_at = null;
      call.mail_sent = false;
      call.updated_by = administratorId;
      call.updated_at = history.changed_at;
      data.service_call_soin_history.push(history);
      writeMockData(data);
      return { call, history };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query('SELECT soin FROM service_calls WHERE id = $1 FOR UPDATE', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      const updated = await client.query(
        `UPDATE service_calls
            SET soin = $1,
                relog_due_at = CURRENT_TIMESTAMP + INTERVAL '47 hours',
                reminder_stage = 0,
                reminder_cycle = reminder_cycle + 1,
                first_reminder_sent_at = NULL,
                reminder_claimed_at = NULL,
                mail_sent = FALSE,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *`,
        [soin, administratorId, id]
      );
      const history = await client.query(
        `INSERT INTO service_call_soin_history (service_call_id, previous_soin, new_soin, administrator_id, reason)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id, existing.rows[0].soin, soin, administratorId, reason || null]
      );
      await client.query('COMMIT');
      return { call: updated.rows[0], history: history.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateSoinFromEmail(id, cycle, soin) {
    if (useSupabase) {
      const { data, error } = await supabase.rpc('update_service_call_soin_from_email', {
        p_id: id,
        p_cycle: cycle,
        p_soin: soin
      });
      if (error) throw error;
      return data;
    }
    await testConnection();
    if (!usePG) {
      const data = readMockData();
      data.service_calls = data.service_calls || [];
      data.service_call_soin_history = data.service_call_soin_history || [];
      const call = data.service_calls.find(item => String(item.id) === String(id));
      if (!call || Number(call.reminder_cycle || 0) !== Number(cycle)
        || Number(call.reminder_stage || 0) < 1 || call.soin === soin) return null;
      if (data.service_calls.some(item => item.id !== call.id && item.soin.toLowerCase() === soin.toLowerCase())) {
        const error = new Error('Duplicate SOIN');
        error.code = '23505';
        throw error;
      }
      const changedAt = new Date().toISOString();
      const history = {
        id: data.service_call_soin_history.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1,
        service_call_id: call.id,
        previous_soin: call.soin,
        new_soin: soin,
        administrator_id: 'email',
        changed_at: changedAt,
        reason: 'Updated using the service-call reminder email'
      };
      Object.assign(call, {
        soin,
        relog_due_at: new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString(),
        reminder_stage: 0,
        reminder_cycle: Number(call.reminder_cycle || 0) + 1,
        first_reminder_sent_at: null,
        reminder_claimed_at: null,
        mail_sent: false,
        updated_by: 'email',
        updated_at: changedAt
      });
      data.service_call_soin_history.push(history);
      writeMockData(data);
      return { call, history };
    }
    const result = await pool.query(
      'SELECT update_service_call_soin_from_email($1, $2, $3) AS result',
      [id, cycle, soin]
    );
    return result.rows[0].result;
  },

  async history(id) {
    if (useSupabase) {
      const { data, error } = await supabase.from('service_call_soin_history')
        .select('*').eq('service_call_id', id).order('changed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    await testConnection();
    if (!usePG) return (readMockData().service_call_soin_history || [])
      .filter(item => String(item.service_call_id) === String(id))
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
    const result = await pool.query(
      'SELECT * FROM service_call_soin_history WHERE service_call_id = $1 ORDER BY changed_at DESC',
      [id]
    );
    return result.rows;
  }
};

module.exports = {
  query: async (text, params) => {
    if (useSupabase) {
      return supabaseQuery(text, params);
    }
    
    await testConnection();
    if (usePG) {
      return pool.query(text, params);
    } else {
      return mockQuery(text, params);
    }
  },
  serviceCalls,
  isSupabase: useSupabase,
  pool
};
