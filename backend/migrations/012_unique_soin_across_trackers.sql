CREATE OR REPLACE FUNCTION prevent_duplicate_soin_across_trackers()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    has_conflict BOOLEAN;
    normalized_soin TEXT;
BEGIN
    normalized_soin := LOWER(BTRIM(NEW.soin));
    IF normalized_soin IS NULL OR normalized_soin = '' THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext(normalized_soin));

    IF TG_TABLE_NAME = 'service_calls' THEN
        SELECT EXISTS (
            SELECT 1
              FROM moto_repairs
             WHERE LOWER(BTRIM(soin)) = normalized_soin
               AND source_service_call_id IS DISTINCT FROM NEW.id
        ) OR EXISTS (
            SELECT 1
              FROM service_calls
             WHERE LOWER(BTRIM(soin)) = normalized_soin
               AND id IS DISTINCT FROM NEW.id
        ) INTO has_conflict;
    ELSE
        IF TG_OP = 'UPDATE' AND NEW.source_service_call_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1
                 FROM service_calls
                WHERE id = NEW.source_service_call_id
                  AND LOWER(BTRIM(soin)) = normalized_soin
           ) THEN
            RAISE EXCEPTION 'Update SOIN from its linked service call.'
                USING ERRCODE = '23505', CONSTRAINT = 'global_soin_unique';
        END IF;

        SELECT EXISTS (
            SELECT 1
              FROM moto_repairs
             WHERE LOWER(BTRIM(soin)) = normalized_soin
               AND id IS DISTINCT FROM NEW.id
        ) OR EXISTS (
            SELECT 1
              FROM service_calls
             WHERE LOWER(BTRIM(soin)) = normalized_soin
               AND id IS DISTINCT FROM NEW.source_service_call_id
        ) INTO has_conflict;
    END IF;

    IF has_conflict THEN
        RAISE EXCEPTION 'SOIN is already in use.'
            USING ERRCODE = '23505', CONSTRAINT = 'global_soin_unique';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_duplicate_soin_service_calls_insert ON service_calls;
CREATE TRIGGER trg_prevent_duplicate_soin_service_calls_insert
BEFORE INSERT ON service_calls
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_soin_across_trackers();

DROP TRIGGER IF EXISTS trg_prevent_duplicate_soin_service_calls_update ON service_calls;
CREATE TRIGGER trg_prevent_duplicate_soin_service_calls_update
BEFORE UPDATE OF soin ON service_calls
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_soin_across_trackers();

DROP TRIGGER IF EXISTS trg_prevent_duplicate_soin_moto_insert ON moto_repairs;
CREATE TRIGGER trg_prevent_duplicate_soin_moto_insert
BEFORE INSERT ON moto_repairs
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_soin_across_trackers();

DROP TRIGGER IF EXISTS trg_prevent_duplicate_soin_moto_update ON moto_repairs;
CREATE TRIGGER trg_prevent_duplicate_soin_moto_update
BEFORE UPDATE OF soin ON moto_repairs
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_soin_across_trackers();

CREATE OR REPLACE FUNCTION sync_moto_repair_soin_from_service_call()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE moto_repairs
       SET soin = NEW.soin,
           updated_at = CURRENT_TIMESTAMP
     WHERE source_service_call_id = NEW.id
       AND soin IS DISTINCT FROM NEW.soin;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_moto_repair_soin_from_service_call ON service_calls;
CREATE TRIGGER trg_sync_moto_repair_soin_from_service_call
AFTER UPDATE OF soin ON service_calls
FOR EACH ROW
WHEN (OLD.soin IS DISTINCT FROM NEW.soin)
EXECUTE FUNCTION sync_moto_repair_soin_from_service_call();
