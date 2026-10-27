CREATE TABLE IF NOT EXISTS service_calls (
    id BIGSERIAL PRIMARY KEY,
    soin VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('Mobile', 'Laptop')),
    imei VARCHAR(15),
    customer_name VARCHAR(150) NOT NULL,
    customer_contact VARCHAR(30) NOT NULL,
    model VARCHAR(150) NOT NULL,
    issue_description TEXT NOT NULL,
    warranty_status VARCHAR(20) NOT NULL CHECK (warranty_status IN ('In Warranty', 'Out of Warranty')),
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('Hardware', 'Software')),
    part_order_status VARCHAR(20) NOT NULL DEFAULT 'Not Yet Ordered'
        CHECK (part_order_status IN ('Ordered', 'Not Yet Ordered')),
    mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
    submission_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    relog_due_at TIMESTAMPTZ NOT NULL,
    quotation_amount NUMERIC(12, 2),
    submitted_amount NUMERIC(12, 2),
    payment_method VARCHAR(10) CHECK (payment_method IN ('Cash', 'QR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$'),
    CHECK (device_type <> 'Mobile' OR imei IS NOT NULL),
    CHECK (quotation_amount IS NULL OR quotation_amount >= 0),
    CHECK (submitted_amount IS NULL OR submitted_amount >= 0),
    CHECK (
        warranty_status = 'In Warranty'
        OR (
            quotation_amount IS NOT NULL
            AND submitted_amount IS NOT NULL
            AND payment_method IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_service_calls_imei ON service_calls (imei);
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_calls_soin_ci ON service_calls (LOWER(soin));
CREATE INDEX IF NOT EXISTS idx_service_calls_submission_at ON service_calls (submission_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_calls_relog_due_at ON service_calls (relog_due_at);
CREATE INDEX IF NOT EXISTS idx_service_calls_warranty_status ON service_calls (warranty_status);
CREATE INDEX IF NOT EXISTS idx_service_calls_call_type ON service_calls (call_type);
CREATE INDEX IF NOT EXISTS idx_service_calls_part_order_status ON service_calls (part_order_status);
CREATE INDEX IF NOT EXISTS idx_service_calls_mail_sent ON service_calls (mail_sent);

CREATE TABLE IF NOT EXISTS service_call_soin_history (
    id BIGSERIAL PRIMARY KEY,
    service_call_id BIGINT NOT NULL REFERENCES service_calls(id),
    previous_soin VARCHAR(100) NOT NULL,
    new_soin VARCHAR(100) NOT NULL,
    administrator_id VARCHAR(100),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_call_soin_history_call
    ON service_call_soin_history (service_call_id, changed_at DESC);

ALTER TABLE service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_call_soin_history ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION set_service_call_relog_due_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.relog_due_at := NEW.submission_at + INTERVAL '47 hours';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_calls_relog_due_at ON service_calls;
CREATE TRIGGER trg_service_calls_relog_due_at
BEFORE INSERT OR UPDATE OF submission_at ON service_calls
FOR EACH ROW
EXECUTE FUNCTION set_service_call_relog_due_at();

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
