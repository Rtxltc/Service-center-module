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

  const validBrands = ['Motorola', 'Dell', 'HP', 'Asus', 'Acer'];
  if (!validBrands.includes(brand)) {
    return res.status(400).json({ error: 'Invalid brand. Must be Motorola, Dell, HP, Asus, or Acer' });
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

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
