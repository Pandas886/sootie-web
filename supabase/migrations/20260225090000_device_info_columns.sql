-- 给 device_keys 表增加设备信息和心跳字段
ALTER TABLE public.device_keys ADD COLUMN IF NOT EXISTS os_type TEXT;
ALTER TABLE public.device_keys ADD COLUMN IF NOT EXISTS hostname TEXT;
ALTER TABLE public.device_keys ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 允许桌面端通过 api_key header 更新自己的设备信息（os_type, hostname, last_seen_at）
CREATE POLICY "Sootie can update own device info" ON public.device_keys
FOR UPDATE USING (
    api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
) WITH CHECK (
    api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
);
