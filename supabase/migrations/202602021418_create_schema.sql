-- Enable UUID extension (Supabase has this, but ensure)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,  -- 'admin', 'cashier'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (links to Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),  -- Restricted values
  reason TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  total_amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  change_given NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sale items table
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_sale NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('cash', 'd-money', 'waafi', 'cac-pay')),  -- Djibouti-specific
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync logs table
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'conflict')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);  -- For reports
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_sync_logs_table ON sync_logs(table_name);

-- Trigger function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all mutable tables
CREATE TRIGGER update_roles_ts BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_users_ts BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_categories_ts BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_products_ts BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_stock_movements_ts BEFORE UPDATE ON stock_movements FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_sales_ts BEFORE UPDATE ON sales FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_sale_items_ts BEFORE UPDATE ON sale_items FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_payments_ts BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Role-based)
-- Roles: Public read (if needed), but mostly role-restricted

-- For roles table: Admins only
CREATE POLICY "Admin full access on roles" ON roles
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));

-- For users: Admins manage all, Cashiers view own
CREATE POLICY "Admin full access on users" ON users
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier own access on users" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- For categories: Admins full, Cashiers read
CREATE POLICY "Admin full access on categories" ON categories
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier read access on categories" ON categories
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'cashier')));

-- For products: Similar to categories
CREATE POLICY "Admin full access on products" ON products
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier read access on products" ON products
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'cashier')));

-- For stock_movements: Admins full, Cashiers insert/select own
CREATE POLICY "Admin full access on stock_movements" ON stock_movements
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier own access on stock_movements" ON stock_movements
  FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- For sales/sale_items/payments: Admins full, Cashiers insert/select own
CREATE POLICY "Admin full access on sales" ON sales
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier own access on sales" ON sales
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Repeat for sale_items and payments (tied to sales)
CREATE POLICY "Admin full access on sale_items" ON sale_items
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier own access on sale_items" ON sale_items
  USING (sale_id IN (SELECT id FROM sales WHERE user_id = auth.uid())) WITH CHECK (sale_id IN (SELECT id FROM sales WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access on payments" ON payments
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));
CREATE POLICY "Cashier own access on payments" ON payments
  USING (sale_id IN (SELECT id FROM sales WHERE user_id = auth.uid())) WITH CHECK (sale_id IN (SELECT id FROM sales WHERE user_id = auth.uid()));

-- For sync_logs: Admins only (debugging)
CREATE POLICY "Admin full access on sync_logs" ON sync_logs
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')));



-- Function to handle new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role_id, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    (SELECT id FROM roles WHERE name = 'cashier'), -- Default cashier; admin can change
    NEW.raw_user_meta_data->>'full_name' -- If provided in signup metadata
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();  