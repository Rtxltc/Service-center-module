ALTER TABLE service_calls
    ADD COLUMN IF NOT EXISTS activation_date DATE,
    ADD COLUMN IF NOT EXISTS warranty_expiry_date DATE,
    ADD COLUMN IF NOT EXISTS mtm_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS market_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS second_imei VARCHAR(15),
    ADD COLUMN IF NOT EXISTS approval_email_sending BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS approval_email_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approval_email_subject TEXT,
    ADD COLUMN IF NOT EXISTS approval_email_to TEXT[],
    ADD COLUMN IF NOT EXISTS approval_email_cc TEXT[],
    ADD COLUMN IF NOT EXISTS approval_request_text TEXT,
    ADD COLUMN IF NOT EXISTS approval_remark TEXT,
    ADD COLUMN IF NOT EXISTS approval_video_link TEXT;

ALTER TABLE service_calls
    DROP CONSTRAINT IF EXISTS service_calls_second_imei_check;
ALTER TABLE service_calls
    ADD CONSTRAINT service_calls_second_imei_check
        CHECK (second_imei IS NULL OR second_imei ~ '^[0-9]{15}$');

CREATE TABLE IF NOT EXISTS gmail_oauth_credentials (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    email VARCHAR(320) NOT NULL,
    encrypted_refresh_token TEXT NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gmail_oauth_credentials ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION claim_service_call_approval_email(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    claimed_id BIGINT;
BEGIN
    UPDATE service_calls
       SET approval_email_sending = TRUE
     WHERE id = p_id
       AND mail_sent = FALSE
       AND approval_email_sending = FALSE
     RETURNING id INTO claimed_id;
    RETURN claimed_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION complete_service_call_approval_email(
    p_id BIGINT,
    p_subject TEXT,
    p_to TEXT[],
    p_cc TEXT[],
    p_request_text TEXT,
    p_remark TEXT,
    p_video_link TEXT,
    p_administrator_id VARCHAR DEFAULT NULL
) RETURNS service_calls
LANGUAGE plpgsql
AS $$
DECLARE
    updated_call service_calls%ROWTYPE;
BEGIN
    UPDATE service_calls
       SET mail_sent = TRUE,
           approval_email_sending = FALSE,
           approval_email_sent_at = CURRENT_TIMESTAMP,
           approval_email_subject = p_subject,
           approval_email_to = p_to,
           approval_email_cc = p_cc,
           approval_request_text = p_request_text,
           approval_remark = p_remark,
           approval_video_link = p_video_link,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = p_administrator_id
     WHERE id = p_id
       AND approval_email_sending = TRUE
     RETURNING * INTO updated_call;
    RETURN updated_call;
END;
$$;

CREATE OR REPLACE FUNCTION release_service_call_approval_email(p_id BIGINT)
RETURNS VOID
LANGUAGE SQL
AS $$
    UPDATE service_calls
       SET approval_email_sending = FALSE
     WHERE id = p_id
       AND approval_email_sending = TRUE
       AND mail_sent = FALSE;
$$;
