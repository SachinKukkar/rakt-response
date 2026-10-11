-- =============================================================================
-- Rakt Response — 0400 storage buckets and policies
--   story-uploads  (private) contributor uploads awaiting moderation
--   story-public   (public)  copies explicitly approved by an administrator
--   profile-photos (private) optional donor profile photos
-- Uploads are validated server-side (type sniffing, size, metadata stripping)
-- before they reach storage; bucket limits are a second line of defence.
-- Skipped automatically when the storage schema is not present (tests).
-- =============================================================================
do $migration$
begin
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise notice 'storage schema not present; skipping bucket setup';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
    ('story-uploads', 'story-uploads', false, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
    ('story-public', 'story-public', true, 3145728, array['image/jpeg', 'image/png', 'image/webp']),
    ('profile-photos', 'profile-photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

  -- Private story uploads: contributors write into their own folder.
  execute $p$
    create policy "story uploads: owner insert" on storage.objects for insert to authenticated
    with check (bucket_id = 'story-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
  $p$;
  execute $p$
    create policy "story uploads: owner or admin read" on storage.objects for select to authenticated
    using (bucket_id = 'story-uploads' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())))
  $p$;
  execute $p$
    create policy "story uploads: owner or admin delete" on storage.objects for delete to authenticated
    using (bucket_id = 'story-uploads' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())))
  $p$;

  -- Public story photos: only administrators publish; the contributor of the
  -- story that references a public photo may delete it (withdrawal).
  execute $p$
    create policy "story public: admin insert" on storage.objects for insert to authenticated
    with check (bucket_id = 'story-public' and (select public.is_admin()))
  $p$;
  execute $p$
    create policy "story public: admin read" on storage.objects for select to authenticated
    using (bucket_id = 'story-public' and (
      (select public.is_admin())
      or exists (select 1 from public.impact_stories s where s.public_photo_path = name and s.contributor_id = (select auth.uid()))
    ))
  $p$;
  execute $p$
    create policy "story public: admin or contributor delete" on storage.objects for delete to authenticated
    using (bucket_id = 'story-public' and (
      (select public.is_admin())
      or exists (select 1 from public.impact_stories s where s.public_photo_path = name and s.contributor_id = (select auth.uid()))
    ))
  $p$;

  -- Profile photos: owner manages their own folder; staff may view.
  execute $p$
    create policy "profile photos: owner insert" on storage.objects for insert to authenticated
    with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  $p$;
  execute $p$
    create policy "profile photos: owner update" on storage.objects for update to authenticated
    using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  $p$;
  execute $p$
    create policy "profile photos: owner or staff read" on storage.objects for select to authenticated
    using (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_staff())))
  $p$;
  execute $p$
    create policy "profile photos: owner or admin delete" on storage.objects for delete to authenticated
    using (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())))
  $p$;
end;
$migration$;
