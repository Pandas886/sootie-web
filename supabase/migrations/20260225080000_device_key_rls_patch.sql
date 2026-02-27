-- 给 device_keys 表添加一个 RLS policy，允许 Desktop Client 通过 api_key header 查询自己的设备信息
-- 这样桌面端启动时可以用 api_key 解析对应的 device_id

CREATE POLICY "Sootie can read own device key via api_key header" ON public.device_keys
FOR SELECT USING (
    api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
);
