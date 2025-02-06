CREATE
OR REPLACE FUNCTION update_modified_column () RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CLOCK_TIMESTAMP();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.users FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.user_credentials FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.user_roles FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.auth_sessions FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.addresses FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.merchants FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.merchant_contact_info FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.merchant_payment_methods FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.merchant_posts FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.discounts FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.products FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.product_categories FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE TRIGGER update_modified_time BEFORE
UPDATE ON hf.orders FOR EACH ROW
EXECUTE FUNCTION update_modified_column ();

CREATE
OR REPLACE FUNCTION set_deleted_time_before_delete () RETURNS TRIGGER AS $$
BEGIN
 EXECUTE 'UPDATE ' || TG_RELID::regclass::text || ' SET deleted_at = CLOCK_TIMESTAMP() WHERE id = ($1).id' USING OLD;

  -- EXCEPTION
    -- WHEN no_data_found THEN
      -- Do nothing if no data was found
    -- WHEN OTHERS THEN
      -- Do nothing on any other error, just prevent the deletion
      -- RAISE EXCEPTION 'Error setting deleted_at';

  -- Prevent the actual delete, as the row is being "soft deleted"
  RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.users FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.merchants FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.orders FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.products FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.addresses FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();

CREATE
OR REPLACE TRIGGER set_deleted_time_before_delete BEFORE DELETE ON hf.discounts FOR EACH ROW
EXECUTE FUNCTION set_deleted_time_before_delete ();
