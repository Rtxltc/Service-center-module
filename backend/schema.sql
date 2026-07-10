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
