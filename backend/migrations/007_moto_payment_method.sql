ALTER TABLE moto_repairs
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(10) NOT NULL DEFAULT 'Cash';

ALTER TABLE moto_repairs
    DROP CONSTRAINT IF EXISTS moto_repairs_payment_method_check;
ALTER TABLE moto_repairs
    ADD CONSTRAINT moto_repairs_payment_method_check
        CHECK (payment_method IN ('Cash', 'QR'));
