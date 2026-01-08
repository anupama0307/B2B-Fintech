-- ============================================
-- RISKOFF - Grievances Table SQL for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    grievance_type TEXT NOT NULL CHECK (grievance_type IN ('rejection_query', 'delay', 'other')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);

-- Enable Row Level Security
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own grievances
CREATE POLICY "Users can view own grievances"
    ON grievances
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own grievances
CREATE POLICY "Users can create grievances"
    ON grievances
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all grievances (via service key, RLS bypassed)
-- Note: Backend uses service role key which bypasses RLS

-- Grant permissions
GRANT ALL ON grievances TO authenticated;
GRANT ALL ON grievances TO service_role;
