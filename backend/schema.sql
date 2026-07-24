-- Repairs Table
CREATE TABLE IF NOT EXISTS repairs (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL, -- 'Motorola', 'Dell', 'HP', 'Asus'
    device_model VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'Walk-in', 'Home Pickup', 'Courier'
    status VARCHAR(50) DEFAULT 'Received', -- 'Received', 'Diagnosis', 'In Repair', 'Quality Check', 'Ready for Pickup', 'Delivered'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on ticket_id and customer_phone for fast tracking lookups
CREATE INDEX IF NOT EXISTS idx_repairs_ticket_id ON repairs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_repairs_customer_phone ON repairs(customer_phone);

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moto Repairs Table (Internal Admin Tracker)
CREATE TABLE IF NOT EXISTS moto_repairs (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) DEFAULT 'Motorola',
    device_model VARCHAR(100) NOT NULL,
    issue_description TEXT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    service_type VARCHAR(50) DEFAULT 'Walk-in',
    status VARCHAR(50) DEFAULT 'Received',
    amount_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    warranty_status VARCHAR(100) DEFAULT 'Out of Warranty',
    receiving_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    giving_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on moto_repairs ticket_id and phone
CREATE INDEX IF NOT EXISTS idx_moto_repairs_ticket ON moto_repairs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_moto_repairs_phone ON moto_repairs(customer_phone);

-- Laptop/Non-Moto Repairs Table (Internal Admin Tracker)
CREATE TABLE IF NOT EXISTS laptop_repairs (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    issue_description TEXT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    service_type VARCHAR(50) DEFAULT 'Walk-in',
    status VARCHAR(50) DEFAULT 'Received',
    amount_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    warranty_status VARCHAR(100) DEFAULT 'Out of Warranty',
    receiving_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    giving_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on laptop_repairs ticket_id and phone
CREATE INDEX IF NOT EXISTS idx_laptop_repairs_ticket ON laptop_repairs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_laptop_repairs_phone ON laptop_repairs(customer_phone);

-- Expenses Table (Internal Admin Tracker)
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
