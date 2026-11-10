CREATE TABLE  IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(30) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_interval VARCHAR(20) NOT NULL
        CHECK (billing_interval IN ('monthly', 'yearly')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, price, billing_interval)
VALUES
    ('Monthly', 20.00, 'monthly'),
    ('Yearly', 180.00, 'yearly')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID UNIQUE NOT NULL REFERENCES businesses(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'trialing'
        CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(30),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role In ('owner', 'manager', 'employee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (phone_number IS NOT NULL OR email IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    symbol VARCHAR(20) UNIQUE NOT NULL
);
INSERT INTO units (name, symbol) VALUES
    ('kilogram', 'kg'),
    ('gram', 'g'),
    ('litre', 'L'),
    ('millilitre', 'ml'),
    ('piece', 'pcs'),
    ('box', 'box'),
    ('pack', 'pack'),
    ('bottle', 'bottle'),
    ('bag', 'bag'),
    ('crate', 'crate')
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    image_url TEXT,
    unit_id UUID NOT NULL REFERENCES units(id),
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    low_stock_threshold NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (quantity >= 0),
    CHECK (low_stock_threshold >= 0)
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    UNIQUE (business_id, name)
);
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    category_id UUID NOT NULL REFERENCES menu_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_required NUMERIC(10,2) NOT NULL,
    CHECK (quantity_required > 0),
    UNIQUE (menu_item_id, product_id)
);

