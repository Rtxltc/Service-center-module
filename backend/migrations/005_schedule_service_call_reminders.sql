DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        RAISE EXCEPTION 'Enable the pg_cron extension in Supabase before scheduling service-call reminders.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        RAISE EXCEPTION 'Enable the pg_net extension in Supabase before scheduling service-call reminders.';
    END IF;
    IF to_regclass('vault.decrypted_secrets') IS NULL THEN
        RAISE EXCEPTION 'Enable Supabase Vault and add the reminder secrets before scheduling service-call reminders.';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_call_reminder_backend_url'
    ) OR NOT EXISTS (
        SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_call_reminder_cron_secret'
    ) THEN
        RAISE EXCEPTION 'Add Vault secrets service_call_reminder_backend_url and service_call_reminder_cron_secret before scheduling.';
    END IF;
END;
$$;

SELECT cron.schedule(
    'service-call-tat-reminders',
    '* * * * *',
    $job$
    SELECT net.http_get(
        url := (
            SELECT decrypted_secret
              FROM vault.decrypted_secrets
             WHERE name = 'service_call_reminder_backend_url'
        ),
        headers := jsonb_build_object(
            'Authorization',
            'Bearer ' || (
                SELECT decrypted_secret
                  FROM vault.decrypted_secrets
                 WHERE name = 'service_call_reminder_cron_secret'
            )
        ),
        timeout_milliseconds := 10000
    );
    $job$
);
