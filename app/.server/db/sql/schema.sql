CREATE SCHEMA "hf";

CREATE TYPE "hf"."role_name" AS ENUM (
  'aDMin',
  'created',
  'merchant_owner',
  'merchant_employee',
  'merchant_customer',
  'guest'
);

CREATE TYPE "hf"."merchant_status" AS ENUM (
  'online',
  'created',
  'offline',
  'shutdown'
);

CREATE TYPE "hf"."media_type" AS ENUM (
  'image',
  'video',
  'audio',
  'pdf',
  'other'
);

CREATE TYPE "hf"."payment_status" AS ENUM (
  'unpaid',
  'paying',
  'error',
  'paid'
);

CREATE TYPE "hf"."payment_method" AS ENUM (
  'COD',
  'online_banking'
);

CREATE TABLE "hf"."roles" (
  "id" serial PRIMARY KEY,
  "name" hf.role_name UNIQUE NOT NULL,
  "merchant_id" integer
);

CREATE TABLE "hf"."users" (
  "id" serial PRIMARY KEY,
  "username" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "phone_number" varchar,
  "email_domain_id" integer NOT NULL,
  "email_local_part" varchar(50) NOT NULL
);

CREATE TABLE "hf"."user_addresses" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "is_work_place" bool,
  "address_id" integer NOT NULL
);

CREATE TABLE "hf"."addresses" (
  "id" serial PRIMARY KEY,
  "phone_number" varchar(20) NOT NULL,
  "street_address" varchar(256) NOT NULL,
  "district_id" varchar NOT NULL,
  "province_id" varchar NOT NULL,
  "coordinates" point,
  "note" varchar(256)
);

CREATE TABLE "hf"."user_roles" (
  "user_id" integer NOT NULL,
  "role_id" integer NOT NULL,
  PRIMARY KEY ("user_id", "role_id")
);

CREATE TABLE "hf"."merchants" (
  "id" serial PRIMARY KEY,
  "name" varchar,
  "description" text,
  "owner_id" integer UNIQUE NOT NULL,
  "status" hf.merchant_status,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "opening_time_window" json,
  "offline_time_window" json
);

CREATE TABLE "hf"."merchant_contact_info" (
  "id" serial PRIMARY KEY,
  "merchant_id" integer UNIQUE NOT NULL,
  "zalo_id" varchar UNIQUE,
  "phone_number" varchar UNIQUE NOT NULL,
  "messenger_id" varchar UNIQUE,
  "facebook_fanpage_url" varchar UNIQUE
);

CREATE TABLE "hf"."merchant_addresses" (
  "id" serial PRIMARY KEY,
  "merchant_id" integer UNIQUE NOT NULL,
  "address_id" integer NOT NULL
);

CREATE TABLE "hf"."merchant_payment_methods" (
  "merchant_id" integer NOT NULL,
  "payment_method" hf.payment_method NOT NULL,
  "note" varchar
);

CREATE TABLE "hf"."discounts" (
  "id" bigserial PRIMARY KEY,
  "name" varchar NOT NULL,
  "discount_percent" decimal,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "note" text,
  "merchant_id" integer NOT NULL,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "hf"."products" (
  "id" serial PRIMARY KEY,
  "sku" varchar(50) UNIQUE NOT NULL,
  "name" varchar NOT NULL,
  "merchant_id" integer NOT NULL,
  "price" integer NOT NULL,
  "discount_id" integer,
  "disabled_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "category_id" integer,
  "quantity" smallint NOT NULL DEFAULT 0
);

CREATE TABLE "hf"."product_media" (
  "product_id" integer NOT NULL,
  "media_url" varchar NOT NULL,
  "type" hf.media_type
);

CREATE TABLE "hf"."follows" (
  "following_user_id" integer NOT NULL,
  "followed_merchant_id" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "hf"."merchant_posts" (
  "id" serial PRIMARY KEY,
  "title" varchar NOT NULL,
  "content" text,
  "merchant_id" integer,
  "status" varchar,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "hf"."product_categories" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "merchant_id" integer NOT NULL,
  "parent_id" integer UNIQUE
);

CREATE TABLE "hf"."orders" (
  "id" bigserial PRIMARY KEY,
  "item_ids" json,
  "user_id" integer NOT NULL,
  "merchant_id" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "delivered_at" timestamptz,
  "done_at" timestamptz,
  "last_updated_at" timestamptz,
  "payment_status" hf.payment_status,
  "payment_method" hf.payment_method,
  "shipping_address_id" integer NOT NULL
);

CREATE TABLE "hf"."order_products" (
  "order_id" bigint NOT NULL,
  "product_id" integer NOT NULL,
  "quantity" smallint NOT NULL,
  "note" text,
  "original_price" integer NOT NULL,
  "sold_price" integer NOT NULL,
  PRIMARY KEY ("order_id", "product_id")
);

CREATE TABLE "administrative_regions" (
  "id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_en" varchar(255) NOT NULL,
  "code_name" varchar(255),
  "code_name_en" varchar(255),
  PRIMARY KEY ("id")
);

CREATE TABLE "administrative_units" (
  "id" integer NOT NULL,
  "full_name" varchar(255),
  "full_name_en" varchar(255),
  "short_name" varchar(255),
  "short_name_en" varchar(255),
  "code_name" varchar(255),
  "code_name_en" varchar(255),
  PRIMARY KEY ("id")
);

CREATE TABLE "provinces" (
  "code" varchar(20) NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_en" varchar(255),
  "full_name" varchar(255) NOT NULL,
  "full_name_en" varchar(255),
  "code_name" varchar(255),
  "administrative_unit_id" integer,
  "administrative_region_id" integer,
  PRIMARY KEY ("code")
);

CREATE TABLE "districts" (
  "code" varchar(20) NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_en" varchar(255),
  "full_name" varchar(255),
  "full_name_en" varchar(255),
  "code_name" varchar(255),
  "province_code" varchar(20),
  "administrative_unit_id" integer,
  PRIMARY KEY ("code")
);

CREATE TABLE "wards" (
  "code" varchar(20) NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_en" varchar(255),
  "full_name" varchar(255),
  "full_name_en" varchar(255),
  "code_name" varchar(255),
  "district_code" varchar(20),
  "administrative_unit_id" integer,
  PRIMARY KEY ("code")
);

CREATE TABLE "email_domains" (
  "id" serial PRIMARY KEY,
  "domain_name" varchar UNIQUE NOT NULL
);

CREATE INDEX ON "hf"."users" ("id");

CREATE UNIQUE INDEX ON "hf"."users" ("email_domain_id", "email_local_part");

CREATE INDEX ON "hf"."merchant_contact_info" ("merchant_id");

CREATE INDEX ON "hf"."merchant_payment_methods" ("merchant_id");

CREATE INDEX ON "hf"."products" ("id");

CREATE INDEX ON "hf"."products" ("merchant_id");

CREATE INDEX ON "hf"."products" ("category_id");

CREATE UNIQUE INDEX ON "hf"."follows" ("following_user_id", "followed_merchant_id");

CREATE INDEX ON "hf"."follows" ("following_user_id");

CREATE INDEX ON "hf"."follows" ("followed_merchant_id");

CREATE INDEX ON "hf"."merchant_posts" ("id");

CREATE INDEX ON "hf"."merchant_posts" ("merchant_id");

CREATE INDEX ON "hf"."merchant_posts" ("title");

CREATE INDEX ON "hf"."merchant_posts" ("status");

CREATE INDEX ON "hf"."orders" ("id");

CREATE INDEX ON "hf"."orders" ("user_id");

CREATE INDEX ON "hf"."orders" ("merchant_id");

CREATE INDEX ON "hf"."orders" ("payment_status");

CREATE INDEX "idx_provinces_region" ON "provinces" ("administrative_region_id");

CREATE INDEX "idx_provinces_unit" ON "provinces" ("administrative_unit_id");

CREATE INDEX "idx_districts_province" ON "districts" ("province_code");

CREATE INDEX "idx_districts_unit" ON "districts" ("administrative_unit_id");

CREATE INDEX "idx_wards_district" ON "wards" ("district_code");

CREATE INDEX "idx_wards_unit" ON "wards" ("administrative_unit_id");

COMMENT ON COLUMN "hf"."user_addresses"."is_work_place" IS 'false for others';

COMMENT ON COLUMN "hf"."addresses"."coordinates" IS 'unused yet due to we don''t plan to become an F&B delivery service, integrated with Gmap APIs later';

COMMENT ON COLUMN "hf"."addresses"."note" IS 'noted by owner';

COMMENT ON COLUMN "hf"."merchants"."description" IS 'may not be used';

COMMENT ON COLUMN "hf"."merchants"."opening_time_window" IS 'format: [[<opened at>, <closed at>], <other days in week...>]';

COMMENT ON COLUMN "hf"."merchants"."offline_time_window" IS 'format: [<offline start time>, <reopen time>]';

COMMENT ON COLUMN "hf"."merchant_posts"."content" IS 'Content of the post';

COMMENT ON COLUMN "hf"."orders"."item_ids" IS 'TBD?????????????????';

COMMENT ON COLUMN "email_domains"."domain_name" IS 'gmail.com,duck.com,...';

ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_region_id_fkey" FOREIGN KEY ("administrative_region_id") REFERENCES "administrative_regions" ("id");

ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units" ("id");

ALTER TABLE "districts" ADD CONSTRAINT "districts_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units" ("id");

ALTER TABLE "districts" ADD CONSTRAINT "districts_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "provinces" ("code");

ALTER TABLE "wards" ADD CONSTRAINT "wards_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "administrative_units" ("id");

ALTER TABLE "wards" ADD CONSTRAINT "wards_district_code_fkey" FOREIGN KEY ("district_code") REFERENCES "districts" ("code");

ALTER TABLE "hf"."roles" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."users" ADD FOREIGN KEY ("email_domain_id") REFERENCES "email_domains" ("id");

ALTER TABLE "hf"."user_addresses" ADD FOREIGN KEY ("user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."user_addresses" ADD FOREIGN KEY ("address_id") REFERENCES "hf"."addresses" ("id");

ALTER TABLE "hf"."addresses" ADD FOREIGN KEY ("district_id") REFERENCES "districts" ("code");

ALTER TABLE "hf"."addresses" ADD FOREIGN KEY ("province_id") REFERENCES "provinces" ("code");

ALTER TABLE "hf"."user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "hf"."roles" ("id");

ALTER TABLE "hf"."users" ADD FOREIGN KEY ("id") REFERENCES "hf"."merchants" ("owner_id");

ALTER TABLE "hf"."merchants" ADD FOREIGN KEY ("id") REFERENCES "hf"."merchant_contact_info" ("merchant_id");

ALTER TABLE "hf"."merchants" ADD FOREIGN KEY ("id") REFERENCES "hf"."merchant_addresses" ("merchant_id");

ALTER TABLE "hf"."merchant_addresses" ADD FOREIGN KEY ("address_id") REFERENCES "hf"."addresses" ("id");

ALTER TABLE "hf"."merchant_payment_methods" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."products" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."products" ADD FOREIGN KEY ("category_id") REFERENCES "hf"."product_categories" ("id");

ALTER TABLE "hf"."products" ADD FOREIGN KEY ("discount_id") REFERENCES "hf"."discounts" ("id");

ALTER TABLE "hf"."product_media" ADD FOREIGN KEY ("product_id") REFERENCES "hf"."products" ("id");

ALTER TABLE "hf"."follows" ADD FOREIGN KEY ("following_user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."follows" ADD FOREIGN KEY ("followed_merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."merchant_posts" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."product_categories" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."product_categories" ADD FOREIGN KEY ("parent_id") REFERENCES "hf"."product_categories" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("shipping_address_id") REFERENCES "hf"."user_addresses" ("id");

ALTER TABLE "hf"."order_products" ADD FOREIGN KEY ("order_id") REFERENCES "hf"."orders" ("id");

ALTER TABLE "hf"."order_products" ADD FOREIGN KEY ("product_id") REFERENCES "hf"."products" ("id");
