alter table public.wechat_login_intents
add column if not exists verification_code text;
