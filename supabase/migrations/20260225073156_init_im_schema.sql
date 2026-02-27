-- Create device_keys table
CREATE TABLE IF NOT EXISTS public.device_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    UNIQUE(user_id, device_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message_content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Device Keys Policies
CREATE POLICY "Users can view own device keys" ON public.device_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own device keys" ON public.device_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own device keys" ON public.device_keys FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies
-- 1. Web App (Authenticated users) can view, insert and delete their own messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- 2. Sootie Desktop Client (Anonymous with API Key in Headers) can view and insert 
CREATE POLICY "Sootie can view messages via API Key" ON public.messages
FOR SELECT USING (
    device_id IN (
        SELECT device_id FROM public.device_keys 
        WHERE api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
    )
);

CREATE POLICY "Sootie can insert assistant messages" ON public.messages
FOR INSERT WITH CHECK (
    device_id IN (
        SELECT device_id FROM public.device_keys 
        WHERE api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
    )
    AND role = 'assistant'
);

-- Enable Realtime for messages (So Web App can listen to assistant replies)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.messages;
