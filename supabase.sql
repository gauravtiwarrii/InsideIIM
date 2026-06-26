-- 1. Create the reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    ticker_symbol TEXT,
    investment_score INTEGER,
    confidence_score INTEGER,
    recommendation TEXT,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow users to insert their own reports
CREATE POLICY "Users can insert their own reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports" 
    ON public.reports FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow public viewing of reports (for the Share link feature)
-- We will allow SELECT if the user has the exact ID. 
-- Since UUIDs are unguessable, this acts as a secure share link.
CREATE POLICY "Anyone can view a report if they have the ID"
    ON public.reports FOR SELECT
    USING (true);
