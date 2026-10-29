ALTER TABLE moto_repairs
    ADD COLUMN IF NOT EXISTS cash_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS qr_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

UPDATE moto_repairs
   SET cash_collected = CASE WHEN payment_method = 'QR' THEN 0 ELSE amount_collected END,
       qr_collected = CASE WHEN payment_method = 'QR' THEN amount_collected ELSE 0 END
 WHERE cash_collected = 0 AND qr_collected = 0 AND amount_collected > 0;

ALTER TABLE moto_repairs
    DROP CONSTRAINT IF EXISTS moto_repairs_cash_collected_check,
    DROP CONSTRAINT IF EXISTS moto_repairs_qr_collected_check;
ALTER TABLE moto_repairs
    ADD CONSTRAINT moto_repairs_cash_collected_check CHECK (cash_collected >= 0),
    ADD CONSTRAINT moto_repairs_qr_collected_check CHECK (qr_collected >= 0);
