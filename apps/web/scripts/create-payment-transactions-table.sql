-- Create payment_transactions table for Stripe payment tracking
-- This table is referenced in the codebase but missing from the database

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_session_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  amount INTEGER, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(50) CHECK (type IN ('job_posting', 'subscription')),
  subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('connect', 'priority', 'exclusive')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_client_id ON payment_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session_id ON payment_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions" ON payment_transactions
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Users can insert their own transactions" ON payment_transactions
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Founding circle members can view all transactions (for revenue tracking)
CREATE POLICY "Founding circle can view all transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'founding_circle'
    )
  );

COMMENT ON TABLE payment_transactions IS 'Stripe payment transactions for job postings and subscriptions';