-- Create signup_analytics table to track user signups with beta status
CREATE TABLE IF NOT EXISTS public.signup_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_beta_signup BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    source TEXT,
    referral_code TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- Add RLS policies
ALTER TABLE public.signup_analytics ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all signup analytics
CREATE POLICY "Admins can view all signup analytics"
    ON public.signup_analytics
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    ));

-- Allow admins to insert signup analytics
CREATE POLICY "Admins can insert signup analytics"
    ON public.signup_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    ));

-- Create index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_signup_analytics_created_at ON public.signup_analytics(created_at);

-- Create index on is_beta_signup for faster filtering
CREATE INDEX IF NOT EXISTS idx_signup_analytics_is_beta ON public.signup_analytics(is_beta_signup);
