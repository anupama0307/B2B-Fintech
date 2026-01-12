-- =============================================
-- RISKOFF - Database Migration Script
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add date_of_birth to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Add disbursement fields to loans table
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursed BOOLEAN DEFAULT FALSE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_date TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_account_id INTEGER;

-- 3. Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_number_masked VARCHAR(20) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'savings' CHECK (account_type IN ('savings', 'current')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view own bank accounts" ON bank_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts" ON bank_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" ON bank_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts" ON bank_accounts
    FOR DELETE USING (auth.uid() = user_id);


-- 4. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    loan_id INTEGER REFERENCES loans(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('DISBURSEMENT', 'EMI_PAYMENT', 'REFUND', 'FEE')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. Update profiles table with profile_photo_url if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;


-- =============================================
-- Verification Queries
-- =============================================

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('bank_accounts', 'payments', 'profiles', 'loans');

-- Check bank_accounts columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bank_accounts' ORDER BY ordinal_position;

-- Check if new columns added to loans
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name IN ('disbursed', 'disbursement_date', 'disbursement_account_id');
