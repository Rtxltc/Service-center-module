ALTER TABLE moto_repairs
    ADD COLUMN IF NOT EXISTS source_service_call_id BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_moto_repairs_source_service_call
    ON moto_repairs (source_service_call_id);

CREATE SEQUENCE IF NOT EXISTS moto_service_call_ticket_seq;

SELECT setval(
    'moto_service_call_ticket_seq',
    COALESCE((
        SELECT MAX(SUBSTRING(ticket_id FROM 9)::BIGINT)
          FROM moto_repairs
         WHERE ticket_id ~ '^MOTO-SC-[0-9]+$'
    ), 0) + 1,
    FALSE
);

CREATE OR REPLACE FUNCTION create_moto_repair_for_oow_service_call()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.device_type = 'Mobile' AND NEW.warranty_status = 'Out of Warranty' THEN
        INSERT INTO moto_repairs (
            ticket_id,
            brand,
            soin,
            device_model,
            issue_description,
            customer_name,
            customer_phone,
            status,
            amount_collected,
            payment_method,
            cash_collected,
            qr_collected,
            warranty_status,
            receiving_date,
            source_service_call_id
        ) VALUES (
            'MOTO-SC-' || NEXTVAL('moto_service_call_ticket_seq')::TEXT,
            'Motorola',
            NEW.soin,
            NEW.model,
            NEW.issue_description,
            NEW.customer_name,
            NEW.customer_contact,
            'Received',
            NEW.submitted_amount,
            NEW.payment_method,
            CASE WHEN NEW.payment_method = 'Cash' THEN NEW.submitted_amount ELSE 0 END,
            CASE WHEN NEW.payment_method = 'QR' THEN NEW.submitted_amount ELSE 0 END,
            NEW.warranty_status,
            NEW.submission_at,
            NEW.id
        )
        ON CONFLICT (source_service_call_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_moto_repair_for_oow_service_call ON service_calls;
CREATE TRIGGER trg_create_moto_repair_for_oow_service_call
AFTER INSERT ON service_calls
FOR EACH ROW
EXECUTE FUNCTION create_moto_repair_for_oow_service_call();
