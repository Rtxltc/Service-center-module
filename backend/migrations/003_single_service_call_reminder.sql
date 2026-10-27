UPDATE service_calls
   SET reminder_stage = 1
 WHERE reminder_stage > 1;

ALTER TABLE service_calls
    DROP CONSTRAINT IF EXISTS service_calls_reminder_stage_check;
ALTER TABLE service_calls
    ADD CONSTRAINT service_calls_reminder_stage_check CHECK (reminder_stage BETWEEN 0 AND 1);

CREATE OR REPLACE FUNCTION claim_due_service_call_reminders(p_limit INTEGER DEFAULT 50)
RETURNS SETOF service_calls
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH candidates AS (
        SELECT id
          FROM service_calls
         WHERE reminder_stage = 0
           AND relog_due_at <= CURRENT_TIMESTAMP
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
