create or replace function public.configure_listens_sync_vault(
    project_url text,
    service_role_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    project_url_secret_id uuid;
    service_key_secret_id uuid;
begin
    select id
    into project_url_secret_id
    from vault.decrypted_secrets
    where name = 'listens_project_url';

    if project_url_secret_id is null then
        perform vault.create_secret(
            project_url,
            'listens_project_url',
            'Base URL used by the scheduled listens sync'
        );
    else
        perform vault.update_secret(project_url_secret_id, project_url);
    end if;

    select id
    into service_key_secret_id
    from vault.decrypted_secrets
    where name = 'listens_service_role_key';

    if service_key_secret_id is null then
        perform vault.create_secret(
            service_role_key,
            'listens_service_role_key',
            'Service key used only by pg_cron to invoke the protected Edge Function'
        );
    else
        perform vault.update_secret(service_key_secret_id, service_role_key);
    end if;

    return jsonb_build_object('configured', true);
end;
$$;

revoke all on function public.configure_listens_sync_vault(text, text)
    from public, anon, authenticated;

grant execute on function public.configure_listens_sync_vault(text, text)
    to service_role;
