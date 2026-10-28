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
        END IF;
    END IF;
    RETURN NEW;
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
       AND reminder_stage = 1
     FOR UPDATE;
    IF NOT FOUND OR old_soin = p_soin THEN
        RETURN NULL;
    END IF;

    UPDATE service_calls
       SET soin = p_soin,
           relog_due_at = CURRENT_TIMESTAMP + INTERVAL '47 hours',
           reminder_stage = 0,
           reminder_cycle = reminder_cycle + 1,
           first_reminder_sent_at = NULL,
           reminder_claimed_at = NULL,
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
