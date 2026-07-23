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

// JSON File Database Helpers and Endpoints (Admin Records and Expenses)
const fs = require('fs');

const motoPath = path.join(__dirname, 'moto.json');
const nonMotoPath = path.join(__dirname, 'non-moto.json');
const overallPath = path.join(__dirname, 'overall.json');

// Helper to safely read JSON
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      if (filePath.endsWith('overall.json')) {
        fs.writeFileSync(filePath, JSON.stringify({ expenses: [] }, null, 2));
      } else {
        fs.writeFileSync(filePath, '[]');
      }
    }
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (!content) return filePath.endsWith('overall.json') ? { expenses: [] } : [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON file:', filePath, err);
    return filePath.endsWith('overall.json') ? { expenses: [] } : [];
  }
};

// Helper to write JSON
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON file:', filePath, err);
  }
};

// Motorola JSON CRUD APIs

// GET Motorola repairs
app.get('/api/admin/moto', checkAdminAuth, (req, res) => {
  const data = readJsonFile(motoPath);
  res.json(data);
});

// POST Motorola repair
app.post('/api/admin/moto', checkAdminAuth, (req, res) => {
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

  const data = readJsonFile(motoPath);
  const ticketId = generateTicketId('Motorola');
  const newId = data.length > 0 ? Math.max(...data.map(r => r.id)) + 1 : 1;

  const newRepair = {
    id: newId,
    ticket_id: ticketId,
    brand: 'Motorola',
    device_model,
    issue_description: issue_description || '',
    customer_name,
    customer_email: customer_email || '',
    customer_phone,
    customer_address: customer_address || '',
    service_type: service_type || 'Walk-in',
    status: status || 'Received',
    amount_collected: amount_collected !== undefined ? parseFloat(amount_collected) : 0.00,
    warranty_status: warranty_status || 'Out of Warranty',
    receiving_date: receiving_date || new Date().toISOString(),
    giving_date: giving_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  data.push(newRepair);
  writeJsonFile(motoPath, data);
  res.status(201).json({ success: true, repair: newRepair });
});

// PUT Motorola repair
app.put('/api/admin/moto/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const data = readJsonFile(motoPath);
  const idx = data.findIndex(r => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  data[idx] = {
    ...data[idx],
    ...updates,
    amount_collected: updates.amount_collected !== undefined ? parseFloat(updates.amount_collected) : data[idx].amount_collected,
    updated_at: new Date().toISOString()
  };

  writeJsonFile(motoPath, data);
  res.json({ success: true, repair: data[idx] });
});

// DELETE Motorola repair
app.delete('/api/admin/moto/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = readJsonFile(motoPath);
  const idx = data.findIndex(r => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const deleted = data.splice(idx, 1);
  writeJsonFile(motoPath, data);
  res.json({ success: true, deleted: deleted[0] });
});

// Non-Motorola JSON CRUD APIs

// GET Non-Motorola repairs
app.get('/api/admin/non-moto', checkAdminAuth, (req, res) => {
  const data = readJsonFile(nonMotoPath);
  res.json(data);
});

// POST Non-Motorola repair
app.post('/api/admin/non-moto', checkAdminAuth, (req, res) => {
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

  const data = readJsonFile(nonMotoPath);
  const ticketId = generateTicketId(brand);
  const newId = data.length > 0 ? Math.max(...data.map(r => r.id)) + 1 : 1;

  const newRepair = {
    id: newId,
    ticket_id: ticketId,
    brand,
    device_model,
    issue_description: issue_description || '',
    customer_name,
    customer_email: customer_email || '',
    customer_phone,
    customer_address: customer_address || '',
    service_type: service_type || 'Walk-in',
    status: status || 'Received',
    amount_collected: amount_collected !== undefined ? parseFloat(amount_collected) : 0.00,
    warranty_status: warranty_status || 'Out of Warranty',
    receiving_date: receiving_date || new Date().toISOString(),
    giving_date: giving_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  data.push(newRepair);
  writeJsonFile(nonMotoPath, data);
  res.status(201).json({ success: true, repair: newRepair });
});

// PUT Non-Motorola repair
app.put('/api/admin/non-moto/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const data = readJsonFile(nonMotoPath);
  const idx = data.findIndex(r => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  data[idx] = {
    ...data[idx],
    ...updates,
    amount_collected: updates.amount_collected !== undefined ? parseFloat(updates.amount_collected) : data[idx].amount_collected,
    updated_at: new Date().toISOString()
  };

  writeJsonFile(nonMotoPath, data);
  res.json({ success: true, repair: data[idx] });
});

// DELETE Non-Motorola repair
app.delete('/api/admin/non-moto/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = readJsonFile(nonMotoPath);
  const idx = data.findIndex(r => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const deleted = data.splice(idx, 1);
  writeJsonFile(nonMotoPath, data);
  res.json({ success: true, deleted: deleted[0] });
});

// Expenses JSON CRUD APIs

// GET Expenses
app.get('/api/admin/expenses', checkAdminAuth, (req, res) => {
  const data = readJsonFile(overallPath);
  const expenses = data.expenses || [];
  res.json(expenses);
});

// POST Expense
app.post('/api/admin/expenses', checkAdminAuth, (req, res) => {
  const { description, amount, expense_date } = req.body;

  if (!description || amount === undefined) {
    return res.status(400).json({ error: 'Description and amount are required' });
  }

  const data = readJsonFile(overallPath);
  if (!data.expenses) data.expenses = [];

  const newId = data.expenses.length > 0 ? Math.max(...data.expenses.map(e => e.id)) + 1 : 1;
  const newExpense = {
    id: newId,
    description,
    amount: parseFloat(amount),
    expense_date: expense_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  data.expenses.push(newExpense);
  writeJsonFile(overallPath, data);
  res.status(201).json({ success: true, expense: newExpense });
});

// PUT Expense
app.put('/api/admin/expenses/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { description, amount, expense_date } = req.body;

  const data = readJsonFile(overallPath);
  if (!data.expenses) data.expenses = [];

  const idx = data.expenses.findIndex(e => e.id === parseInt(id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Expense record not found' });
  }

  if (description !== undefined) data.expenses[idx].description = description;
  if (amount !== undefined) data.expenses[idx].amount = parseFloat(amount);
  if (expense_date !== undefined) data.expenses[idx].expense_date = expense_date;

  writeJsonFile(overallPath, data);
  res.json({ success: true, expense: data.expenses[idx] });
});

// DELETE Expense
app.delete('/api/admin/expenses/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;

  const data = readJsonFile(overallPath);
  if (!data.expenses) data.expenses = [];

  const idx = data.expenses.findIndex(e => e.id === parseInt(id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Expense record not found' });
  }

  const deleted = data.expenses.splice(idx, 1);
  writeJsonFile(overallPath, data);
  res.json({ success: true, deleted: deleted[0] });
});

// GET Financial Overview (Summary of profits/losses)
app.get('/api/admin/overview', checkAdminAuth, (req, res) => {
  const motoData = readJsonFile(motoPath);
  const nonMotoData = readJsonFile(nonMotoPath);
  const overallData = readJsonFile(overallPath);
  const expenses = overallData.expenses || [];

  // Calculate totals
  const motoRevenue = motoData.reduce((sum, r) => sum + (parseFloat(r.amount_collected) || 0), 0);
  const nonMotoRevenue = nonMotoData.reduce((sum, r) => sum + (parseFloat(r.amount_collected) || 0), 0);
  const totalRevenue = motoRevenue + nonMotoRevenue;
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  res.json({
    motoRevenue,
    nonMotoRevenue,
    totalRevenue,
    totalExpenses,
    netProfit,
    motoCount: motoData.length,
    nonMotoCount: nonMotoData.length,
    expensesCount: expenses.length
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
