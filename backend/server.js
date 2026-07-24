const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local testing, can lock down to specific URL if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password']
}));
app.use(express.json());

// Helper function to generate unique Ticket ID
const generateTicketId = (brand) => {
  const isMoto = brand.toLowerCase() === 'motorola';
  const prefix = isMoto ? 'MOTO' : 'LAP';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${random}`;
};

// Admin middleware checker
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers['x-admin-password'];
  if (authHeader === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Service Center API is running smoothly' });
});

// 2. Submit new repair request (Book repair)
app.post('/api/repairs', async (req, res) => {
  const {
    brand,
    device_model,
    issue_description,
    customer_name,
    customer_email,
    customer_phone,
    service_type
  } = req.body;

  // Basic validation
  if (!brand || !device_model || !issue_description || !customer_name || !customer_email || !customer_phone || !service_type) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const validBrands = ['Motorola', 'Dell', 'HP', 'Asus', 'Acer', 'Lenovo'];
  if (!validBrands.includes(brand)) {
    return res.status(400).json({ error: 'Invalid brand. Must be Motorola, Dell, HP, Asus, Acer, or Lenovo' });
  }

  try {
    let ticketId;
    let isUnique = false;
    let attempts = 0;

    // Ensure Ticket ID is unique in DB
    while (!isUnique && attempts < 10) {
      ticketId = generateTicketId(brand);
      const checkRes = await db.query('SELECT 1 FROM repairs WHERE ticket_id = $1', [ticketId]);
      if (checkRes.rowCount === 0) {
        isUnique = true;
      }
      attempts++;
    }

    const queryText = `
      INSERT INTO repairs (ticket_id, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Received')
      RETURNING *
    `;
    const params = [ticketId, brand, device_model, issue_description, customer_name, customer_email, customer_phone, service_type];
    
    const result = await db.query(queryText, params);
    res.status(201).json({
      success: true,
      message: 'Repair booked successfully',
      repair: result.rows[0]
    });
  } catch (err) {
    console.error('Error booking repair:', err);
    res.status(500).json({ error: 'Failed to book repair. Server error.' });
  }
});

// 3. Search repair status (Looks up by ticket_id OR customer_phone)
app.get('/api/repairs/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cleanQuery = query.trim().toUpperCase();

  try {
    // If it starts with MOTO- or LAP- and is followed by characters, search ticket_id
    const isTicketIdPattern = /^(MOTO|LAP)-[A-Z0-9]{5}$/.test(cleanQuery);
    
    let result;
    if (isTicketIdPattern) {
      result = await db.query('SELECT * FROM repairs WHERE ticket_id = $1', [cleanQuery]);
    } else {
      // Otherwise, search by customer_phone
      result = await db.query('SELECT * FROM repairs WHERE customer_phone = $1 OR customer_phone LIKE $2 ORDER BY created_at DESC', [query, `%${query}%`]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error searching repair status:', err);
    res.status(500).json({ error: 'Failed to search repair. Server error.' });
  }
});

// 4. Retrieve specific repair by Ticket ID
app.get('/api/repairs/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  const cleanId = ticketId.trim().toUpperCase();

  try {
    const result = await db.query('SELECT * FROM repairs WHERE ticket_id = $1', [cleanId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Repair ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching repair ticket:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Submit contact message
app.post('/api/contacts', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, Email, and Message are required' });
  }

  try {
    const queryText = 'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await db.query(queryText, [name, email, phone || null, message]);
    res.status(201).json({
      success: true,
      message: 'Contact message received successfully',
      contact: result.rows[0]
    });
  } catch (err) {
    console.error('Error submitting contact message:', err);
    res.status(500).json({ error: 'Failed to save contact message. Server error.' });
  }
});

// ADMIN API ENDPOINTS (Protected)

// 6. Get all repairs
app.get('/api/admin/repairs', checkAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM repairs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin repairs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 7. Update repair status
app.put('/api/admin/repairs/:id/status', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Received', 'Diagnosis', 'In Repair', 'Quality Check', 'Ready for Pickup', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const queryText = `
      UPDATE repairs
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(queryText, [status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Repair request not found' });
    }
    res.json({
      success: true,
      message: 'Repair status updated',
      repair: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 8. Get all contact inquiries
app.get('/api/admin/contacts', checkAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper to safely parse dates for PostgreSQL (converts empty/whitespace strings to null)
const parseDbDate = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
};

// --- Motorola PostgreSQL CRUD APIs ---

// GET Motorola repairs
app.get('/api/admin/moto', checkAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM moto_repairs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching moto repairs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST Motorola repair
app.post('/api/admin/moto', checkAdminAuth, async (req, res) => {
  const {
    device_model,
    issue_description,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    service_type,
    status,
    amount_collected,
    warranty_status,
    receiving_date,
    giving_date
  } = req.body;

  if (!device_model || !customer_name || !customer_phone) {
    return res.status(400).json({ error: 'Device model, customer name, and phone are required' });
  }

  try {
    const ticketId = generateTicketId('Motorola');
    const queryText = `
      INSERT INTO moto_repairs (
        ticket_id, brand, device_model, issue_description, customer_name, 
        customer_email, customer_phone, customer_address, service_type, 
        status, amount_collected, warranty_status, receiving_date, giving_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      ticketId,
      'Motorola',
      device_model,
      issue_description || '',
      customer_name,
      customer_email || '',
      customer_phone,
      customer_address || '',
      service_type || 'Walk-in',
      status || 'Received',
      amount_collected !== undefined ? parseFloat(amount_collected) : 0.00,
      warranty_status || 'Out of Warranty',
      parseDbDate(receiving_date) || new Date().toISOString(),
      parseDbDate(giving_date)
    ];
    const result = await db.query(queryText, values);
    res.status(201).json({ success: true, repair: result.rows[0] });
  } catch (err) {
    console.error('Error creating moto repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT Motorola repair
app.put('/api/admin/moto/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const getRes = await db.query('SELECT * FROM moto_repairs WHERE id = $1', [id]);
    if (getRes.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const existing = getRes.rows[0];
    const merged = { ...existing, ...req.body };

    const queryText = `
      UPDATE moto_repairs SET
        device_model = $1,
        issue_description = $2,
        customer_name = $3,
        customer_email = $4,
        customer_phone = $5,
        customer_address = $6,
        service_type = $7,
        status = $8,
        amount_collected = $9,
        warranty_status = $10,
        receiving_date = $11,
        giving_date = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;
    const values = [
      merged.device_model,
      merged.issue_description,
      merged.customer_name,
      merged.customer_email,
      merged.customer_phone,
      merged.customer_address,
      merged.service_type,
      merged.status,
      merged.amount_collected !== undefined ? parseFloat(merged.amount_collected) : 0.00,
      merged.warranty_status,
      parseDbDate(merged.receiving_date) || new Date().toISOString(),
      parseDbDate(merged.giving_date),
      id
    ];
    const result = await db.query(queryText, values);
    res.json({ success: true, repair: result.rows[0] });
  } catch (err) {
    console.error('Error updating moto repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE Motorola repair
app.delete('/api/admin/moto/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM moto_repairs WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting moto repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Non-Motorola (Laptop) PostgreSQL CRUD APIs ---

// GET Non-Motorola repairs
app.get('/api/admin/non-moto', checkAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM laptop_repairs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching laptop repairs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST Non-Motorola repair
app.post('/api/admin/non-moto', checkAdminAuth, async (req, res) => {
  const {
    brand,
    device_model,
    issue_description,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    service_type,
    status,
    amount_collected,
    warranty_status,
    receiving_date,
    giving_date
  } = req.body;

  if (!brand || !device_model || !customer_name || !customer_phone) {
    return res.status(400).json({ error: 'Brand, device model, customer name, and phone are required' });
  }

  try {
    const ticketId = generateTicketId(brand);
    const queryText = `
      INSERT INTO laptop_repairs (
        ticket_id, brand, device_model, issue_description, customer_name, 
        customer_email, customer_phone, customer_address, service_type, 
        status, amount_collected, warranty_status, receiving_date, giving_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      ticketId,
      brand,
      device_model,
      issue_description || '',
      customer_name,
      customer_email || '',
      customer_phone,
      customer_address || '',
      service_type || 'Walk-in',
      status || 'Received',
      amount_collected !== undefined ? parseFloat(amount_collected) : 0.00,
      warranty_status || 'Out of Warranty',
      parseDbDate(receiving_date) || new Date().toISOString(),
      parseDbDate(giving_date)
    ];
    const result = await db.query(queryText, values);
    res.status(201).json({ success: true, repair: result.rows[0] });
  } catch (err) {
    console.error('Error creating laptop repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT Non-Motorola repair
app.put('/api/admin/non-moto/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const getRes = await db.query('SELECT * FROM laptop_repairs WHERE id = $1', [id]);
    if (getRes.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const existing = getRes.rows[0];
    const merged = { ...existing, ...req.body };

    const queryText = `
      UPDATE laptop_repairs SET
        brand = $1,
        device_model = $2,
        issue_description = $3,
        customer_name = $4,
        customer_email = $5,
        customer_phone = $6,
        customer_address = $7,
        service_type = $8,
        status = $9,
        amount_collected = $10,
        warranty_status = $11,
        receiving_date = $12,
        giving_date = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;
    const values = [
      merged.brand,
      merged.device_model,
      merged.issue_description,
      merged.customer_name,
      merged.customer_email,
      merged.customer_phone,
      merged.customer_address,
      merged.service_type,
      merged.status,
      merged.amount_collected !== undefined ? parseFloat(merged.amount_collected) : 0.00,
      merged.warranty_status,
      parseDbDate(merged.receiving_date) || new Date().toISOString(),
      parseDbDate(merged.giving_date),
      id
    ];
    const result = await db.query(queryText, values);
    res.json({ success: true, repair: result.rows[0] });
  } catch (err) {
    console.error('Error updating laptop repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE Non-Motorola repair
app.delete('/api/admin/non-moto/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM laptop_repairs WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting laptop repair:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Expenses PostgreSQL CRUD APIs ---

// GET Expenses
app.get('/api/admin/expenses', checkAdminAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST Expense
app.post('/api/admin/expenses', checkAdminAuth, async (req, res) => {
  const { description, amount, expense_date } = req.body;

  if (!description || amount === undefined) {
    return res.status(400).json({ error: 'Description and amount are required' });
  }

  try {
    const queryText = `
      INSERT INTO expenses (description, amount, expense_date)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      description,
      parseFloat(amount),
      parseDbDate(expense_date) || new Date().toISOString().split('T')[0]
    ];
    const result = await db.query(queryText, values);
    res.status(201).json({ success: true, expense: result.rows[0] });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT Expense
app.put('/api/admin/expenses/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const getRes = await db.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (getRes.rowCount === 0) {
      return res.status(404).json({ error: 'Expense record not found' });
    }
    const existing = getRes.rows[0];
    const merged = { ...existing, ...req.body };

    const queryText = `
      UPDATE expenses SET
        description = $1,
        amount = $2,
        expense_date = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [
      merged.description,
      parseFloat(merged.amount),
      parseDbDate(merged.expense_date) || new Date().toISOString().split('T')[0],
      id
    ];
    const result = await db.query(queryText, values);
    res.json({ success: true, expense: result.rows[0] });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE Expense
app.delete('/api/admin/expenses/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense record not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Financial Overview (Aggregates sum metrics from DB tables)
app.get('/api/admin/overview', checkAdminAuth, async (req, res) => {
  try {
    const motoSumQuery = await db.query('SELECT COALESCE(SUM(amount_collected), 0) as total, COUNT(*) as count FROM moto_repairs');
    const nonMotoSumQuery = await db.query('SELECT COALESCE(SUM(amount_collected), 0) as total, COUNT(*) as count FROM laptop_repairs');
    const expensesSumQuery = await db.query('SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses');

    const motoRevenue = parseFloat(motoSumQuery.rows[0].total);
    const nonMotoRevenue = parseFloat(nonMotoSumQuery.rows[0].total);
    const totalRevenue = motoRevenue + nonMotoRevenue;
    const totalExpenses = parseFloat(expensesSumQuery.rows[0].total);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      motoRevenue,
      nonMotoRevenue,
      totalRevenue,
      totalExpenses,
      netProfit,
      motoCount: parseInt(motoSumQuery.rows[0].count),
      nonMotoCount: parseInt(nonMotoSumQuery.rows[0].count),
      expensesCount: parseInt(expensesSumQuery.rows[0].count)
    });
  } catch (err) {
    console.error('Error generating financial overview:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
