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
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
  isSupabase: useSupabase,
  pool
};
