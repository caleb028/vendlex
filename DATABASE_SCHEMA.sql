-- ============================================================================
-- VendLex Kenya Platform — Production PostgreSQL Database Schema
-- Version: 2.0.0
-- Market: Kenya (47 Counties) | Escrow & Lipa na M-Pesa Native Integration
-- ============================================================================

-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SELLER', 'TECHNICIAN', 'ADMIN');
CREATE TYPE subscription_plan AS ENUM ('STARTER', 'BUSINESS', 'ENTERPRISE');
CREATE TYPE order_status AS ENUM ('PAID_ESCROW', 'DISPATCHED', 'DELIVERED', 'RELEASED', 'REFUNDED');
CREATE TYPE escrow_status AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'SPLIT');
CREATE TYPE courier_partner AS ENUM ('FARGO', 'G4S', 'WELLS_FARGO', 'BODA_LOCAL');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE service_status AS ENUM ('PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER',
    county VARCHAR(60) DEFAULT 'Nairobi',
    town VARCHAR(60) DEFAULT 'CBD',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORES / BUSINESSES TABLE
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    category VARCHAR(80) NOT NULL,
    county VARCHAR(60) NOT NULL,
    town VARCHAR(60) NOT NULL,
    kra_pin VARCHAR(20),
    cr12_number VARCHAR(30),
    business_permit VARCHAR(40),
    verification_score INT DEFAULT 65,
    is_verified BOOLEAN DEFAULT FALSE,
    subscription_plan subscription_plan DEFAULT 'STARTER',
    loan_credit_limit DECIMAL(12,2) DEFAULT 0.00,
    logo_url TEXT,
    cover_url TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    sku VARCHAR(60) UNIQUE NOT NULL,
    category VARCHAR(80) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    ai_suggested_price DECIMAL(10,2),
    stock_count INT DEFAULT 10,
    low_stock_threshold INT DEFAULT 3,
    description TEXT,
    images TEXT[] NOT NULL,
    county VARCHAR(60) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    fraud_risk_score NUMERIC(4,2) DEFAULT 0.05,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDERS & ESCROW TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_county VARCHAR(60) NOT NULL,
    delivery_town VARCHAR(60) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 250.00,
    total_amount DECIMAL(10,2) NOT NULL,
    mpesa_receipt VARCHAR(30) NOT NULL,
    status order_status DEFAULT 'PAID_ESCROW',
    courier_partner courier_partner DEFAULT 'FARGO',
    tracking_code VARCHAR(50),
    has_insurance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ESCROW PAYOUT SPLITS TABLE
CREATE TABLE escrow_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id),
    payout_amount DECIMAL(10,2) NOT NULL,
    status escrow_status DEFAULT 'HELD',
    mpesa_b2c_ref VARCHAR(40),
    released_at TIMESTAMP WITH TIME ZONE
);

-- 6. SERVICES & TECHNICIANS TABLE
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_category VARCHAR(80) NOT NULL,
    county VARCHAR(60) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.90,
    badge VARCHAR(40) DEFAULT 'Verified Pro',
    is_available BOOLEAN DEFAULT TRUE,
    total_earnings DECIMAL(12,2) DEFAULT 0.00
);

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    technician_id UUID REFERENCES technicians(id),
    service_title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    county VARCHAR(60) NOT NULL,
    town VARCHAR(60) NOT NULL,
    quote_amount DECIMAL(10,2) NOT NULL,
    status service_status DEFAULT 'PENDING',
    appointment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMMUNITY FORUM POSTS TABLE
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(60) NOT NULL,
    county VARCHAR(60) DEFAULT 'Nairobi',
    upvotes INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_county ON products(county);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_stores_county ON stores(county);
