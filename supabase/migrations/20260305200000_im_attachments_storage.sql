-- Private storage bucket for IM attachments
insert into storage.buckets (id, name, public, file_size_limit)
values ('im-attachments', 'im-attachments', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

-- Authenticated web users can read their own attachment objects.
create policy "Users can read own im attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'im-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.device_keys dk
    where dk.user_id = auth.uid()
      and dk.device_id = (storage.foldername(name))[2]
  )
);

-- Authenticated web users can upload only to their own attachment namespace.
create policy "Users can upload own im attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'im-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.device_keys dk
    where dk.user_id = auth.uid()
      and dk.device_id = (storage.foldername(name))[2]
  )
);

-- Desktop/WebIM gateway can read only files under the device scope resolved by x-sootie-api-key.
create policy "Sootie device key can read own im attachments"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'im-attachments'
  and exists (
    select 1
    from public.device_keys dk
    where dk.api_key = current_setting('request.headers', true)::json->>'x-sootie-api-key'
      and dk.user_id::text = (storage.foldername(name))[1]
      and dk.device_id = (storage.foldername(name))[2]
  )
);
