ALTER TABLE laptop_repairs
    ADD COLUMN IF NOT EXISTS cash_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS qr_collected NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

UPDATE laptop_repairs
   SET cash_collected = amount_collected,
       qr_collected = 0
 WHERE cash_collected = 0
   AND qr_collected = 0
   AND amount_collected > 0;

ALTER TABLE laptop_repairs
    DROP CONSTRAINT IF EXISTS laptop_repairs_cash_collected_check,
    DROP CONSTRAINT IF EXISTS laptop_repairs_qr_collected_check;
ALTER TABLE laptop_repairs
    ADD CONSTRAINT laptop_repairs_cash_collected_check CHECK (cash_collected >= 0),
    ADD CONSTRAINT laptop_repairs_qr_collected_check CHECK (qr_collected >= 0);
