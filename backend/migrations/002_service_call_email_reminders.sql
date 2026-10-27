ALTER TABLE service_calls
    ADD COLUMN IF NOT EXISTS reminder_stage SMALLINT NOT NULL DEFAULT 2,
    ADD COLUMN IF NOT EXISTS reminder_cycle INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS first_reminder_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reminder_claimed_at TIMESTAMPTZ;

ALTER TABLE service_calls
    ALTER COLUMN reminder_stage SET DEFAULT 0;

ALTER TABLE service_calls
    DROP CONSTRAINT IF EXISTS service_calls_reminder_stage_check;
ALTER TABLE service_calls
    ADD CONSTRAINT service_calls_reminder_stage_check CHECK (reminder_stage BETWEEN 0 AND 2);

CREATE OR REPLACE FUNCTION set_service_call_relog_due_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.relog_due_at := NEW.submission_at + INTERVAL '47 hours';
    IF TG_OP = 'UPDATE' THEN
        IF NEW.submission_at IS DISTINCT FROM OLD.submission_at THEN
            NEW.reminder_stage := 0;
            NEW.reminder_cycle := OLD.reminder_cycle + 1;
            NEW.first_reminder_sent_at := NULL;
            NEW.reminder_claimed_at := NULL;
            NEW.mail_sent := FALSE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION claim_due_service_call_reminders(p_limit INTEGER DEFAULT 50)
RETURNS SETOF service_calls
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH candidates AS (
        SELECT id
          FROM service_calls
         WHERE (
             (reminder_stage = 0 AND relog_due_at <= CURRENT_TIMESTAMP)
             OR (
                 reminder_stage = 1
                 AND first_reminder_sent_at <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
             )
         )
           AND (reminder_claimed_at IS NULL
                OR reminder_claimed_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes')
         ORDER BY relog_due_at
         FOR UPDATE SKIP LOCKED
         LIMIT GREATEST(1, LEAST(p_limit, 100))
    )
    UPDATE service_calls AS calls
       SET reminder_claimed_at = CURRENT_TIMESTAMP
      FROM candidates
     WHERE calls.id = candidates.id
    RETURNING calls.*;
END;
$$;

CREATE OR REPLACE FUNCTION update_service_call_soin(
    p_id BIGINT,
    p_soin VARCHAR,
    p_administrator_id VARCHAR DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    old_soin VARCHAR(100);
    updated_call service_calls%ROWTYPE;
    history_entry service_call_soin_history%ROWTYPE;
BEGIN
    SELECT soin INTO old_soin FROM service_calls WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    UPDATE service_calls
       SET soin = p_soin,
           relog_due_at = CURRENT_TIMESTAMP + INTERVAL '47 hours',
           reminder_stage = 0,
           reminder_cycle = reminder_cycle + 1,
           first_reminder_sent_at = NULL,
           reminder_claimed_at = NULL,
           mail_sent = FALSE,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = p_administrator_id
     WHERE id = p_id
     RETURNING * INTO updated_call;

    INSERT INTO service_call_soin_history (
        service_call_id, previous_soin, new_soin, administrator_id, reason
    ) VALUES (
        p_id, old_soin, p_soin, p_administrator_id, p_reason
    )
    RETURNING * INTO history_entry;

    RETURN jsonb_build_object('call', to_jsonb(updated_call), 'history', to_jsonb(history_entry));
END;
$$;

CREATE OR REPLACE FUNCTION update_service_call_soin_from_email(
    p_id BIGINT,
    p_cycle INTEGER,
    p_soin VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    old_soin VARCHAR(100);
    updated_call service_calls%ROWTYPE;
    history_entry service_call_soin_history%ROWTYPE;
BEGIN
    SELECT soin INTO old_soin
      FROM service_calls
     WHERE id = p_id
       AND reminder_cycle = p_cycle
       AND reminder_stage IN (1, 2)
     FOR UPDATE;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    IF old_soin = p_soin THEN
        RETURN NULL;
    END IF;

    UPDATE service_calls
       SET soin = p_soin,
           relog_due_at = CURRENT_TIMESTAMP + INTERVAL '47 hours',
           reminder_stage = 0,
           reminder_cycle = reminder_cycle + 1,
           first_reminder_sent_at = NULL,
           reminder_claimed_at = NULL,
           mail_sent = FALSE,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = 'email'
     WHERE id = p_id
     RETURNING * INTO updated_call;

    INSERT INTO service_call_soin_history (
        service_call_id, previous_soin, new_soin, administrator_id, reason
    ) VALUES (
        p_id, old_soin, p_soin, 'email', 'Updated using the service-call reminder email')
    RETURNING * INTO history_entry;

    RETURN jsonb_build_object('call', to_jsonb(updated_call), 'history', to_jsonb(history_entry));
END;
$$;
