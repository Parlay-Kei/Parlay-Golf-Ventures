-- Subscription Database Schema

-- Customer table to store Stripe customer information
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription table to store subscription information
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Method table to store payment method information
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE,
  type TEXT NOT NULL,
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice table to store invoice information
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount_due INTEGER,
  amount_paid INTEGER,
  currency TEXT,
  status TEXT,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription history table to track subscription changes
CREATE TABLE IF NOT EXISTS subscription_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  previous_tier TEXT,
  new_tier TEXT,
  previous_status TEXT,
  new_status TEXT,
  change_type TEXT NOT NULL, -- 'created', 'updated', 'canceled', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stripe product catalog
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  stripe_product_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stripe price catalog
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  stripe_price_id TEXT UNIQUE,
  stripe_product_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  currency TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,
  interval TEXT NOT NULL, -- 'month', 'year', etc.
  interval_count INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (stripe_product_id) REFERENCES products(stripe_product_id) ON DELETE CASCADE
);

-- Row Level Security Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Customers table policies
CREATE POLICY "Users can view their own customer data."
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Only service role can insert customer data."
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE POLICY "Only service role can update customer data."
  ON customers FOR UPDATE
  USING (auth.uid() = id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions."
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert subscriptions."
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE POLICY "Only service role can update subscriptions."
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE POLICY "Only service role can delete subscriptions."
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Payment Methods table policies
CREATE POLICY "Users can view their own payment methods."
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert payment methods."
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE POLICY "Only service role can update payment methods."
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

CREATE POLICY "Only service role can delete payment methods."
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Invoices table policies
CREATE POLICY "Users can view their own invoices."
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert invoices."
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Subscription history table policies
CREATE POLICY "Users can view their own subscription history."
  ON subscription_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can insert subscription history."
  ON subscription_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Products table policies
CREATE POLICY "Anyone can view active products."
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Only service role can manage products."
  ON products FOR ALL
  USING (auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Prices table policies
CREATE POLICY "Anyone can view active prices."
  ON prices FOR SELECT
  USING (active = true);

CREATE POLICY "Only service role can manage prices."
  ON prices FOR ALL
  USING (auth.jwt() ? auth.jwt()->>'role' = 'service_role' : false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS subscription_history_user_id_idx ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS prices_tier_idx ON prices(tier);

-- Function to update user_tier in profiles table when subscription changes
CREATE OR REPLACE FUNCTION update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the subscription is active
  IF NEW.status = 'active' THEN
    UPDATE profiles
    SET tier = NEW.tier
    WHERE id = NEW.user_id;
  -- If subscription is canceled, set tier to 'free'
  ELSIF NEW.status = 'canceled' THEN
    UPDATE profiles
    SET tier = 'free'
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user_tier when subscription changes
CREATE TRIGGER update_user_tier_trigger
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_tier();

-- Function to log subscription history
CREATE OR REPLACE FUNCTION log_subscription_history()
RETURNS TRIGGER AS $$
BEGIN
  -- For new subscriptions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (
      user_id,
      stripe_subscription_id,
      previous_tier,
      new_tier,
      previous_status,
      new_status,
      change_type
    ) VALUES (
      NEW.user_id,
      NEW.stripe_subscription_id,
      NULL,
      NEW.tier,
      NULL,
      NEW.status,
      'created'
    );
  -- For updated subscriptions
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if tier or status changed
    IF NEW.tier <> OLD.tier OR NEW.status <> OLD.status THEN
      INSERT INTO subscription_history (
        user_id,
        stripe_subscription_id,
        previous_tier,
        new_tier,
        previous_status,
        new_status,
        change_type
      ) VALUES (
        NEW.user_id,
        NEW.stripe_subscription_id,
        OLD.tier,
        NEW.tier,
        OLD.status,
        NEW.status,
        CASE
          WHEN NEW.status = 'canceled' THEN 'canceled'
          WHEN NEW.tier <> OLD.tier THEN 'tier_changed'
          ELSE 'status_changed'
        END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log subscription history
CREATE TRIGGER log_subscription_history_trigger
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION log_subscription_history();

-- Insert initial product data
INSERT INTO products (stripe_product_id, name, description, active)
VALUES 
  ('prod_driven', 'Driven Membership', 'Perfect for getting started with golf fundamentals', true),
  ('prod_aspiring', 'Aspiring Membership', 'For golfers ready to take their game to the next level', true),
  ('prod_breakthrough', 'Breakthrough Membership', 'For serious players aiming for excellence', true)
ON CONFLICT (stripe_product_id) DO NOTHING;

-- Insert initial price data
INSERT INTO prices (stripe_price_id, stripe_product_id, tier, currency, unit_amount, interval, active)
VALUES 
  ('price_driven_monthly', 'prod_driven', 'driven', 'usd', 4900, 'month', true),
  ('price_aspiring_monthly', 'prod_aspiring', 'aspiring', 'usd', 9900, 'month', true),
  ('price_breakthrough_monthly', 'prod_breakthrough', 'breakthrough', 'usd', 19900, 'month', true),
  ('price_driven_yearly', 'prod_driven', 'driven', 'usd', 49000, 'year', true),
  ('price_aspiring_yearly', 'prod_aspiring', 'aspiring', 'usd', 99000, 'year', true),
  ('price_breakthrough_yearly', 'prod_breakthrough', 'breakthrough', 'usd', 199000, 'year', true)
ON CONFLICT (stripe_price_id) DO NOTHING;
