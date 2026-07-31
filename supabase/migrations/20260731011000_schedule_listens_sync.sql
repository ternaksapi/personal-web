create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
    if exists (
        select 1
        from cron.job
        where jobname = 'sync-listens-every-six-hours'
    ) then
        perform cron.unschedule('sync-listens-every-six-hours');
    end if;
end
$$;

select cron.schedule(
    'sync-listens-every-six-hours',
    '17 */6 * * *',
    $$
    select net.http_post(
        url := (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'listens_project_url'
        ) || '/functions/v1/sync-listens',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'listens_service_role_key'
            ),
            'Authorization', 'Bearer ' || (
                select decrypted_secret
                from vault.decrypted_secrets
                where name = 'listens_service_role_key'
            )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 120000
    ) as request_id
    where exists (
        select 1
        from vault.decrypted_secrets
        where name = 'listens_project_url'
    )
    and exists (
        select 1
        from vault.decrypted_secrets
        where name = 'listens_service_role_key'
    );
    $$
);
