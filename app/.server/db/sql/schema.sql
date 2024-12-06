CREATE SCHEMA "hf";

CREATE TYPE "hf"."role_names" AS ENUM (
  'aDMin',
  'created',
  'merchant_owner',
  'merchant_employee',
  'merchant_customer',
  'guest'
);

CREATE TYPE "hf"."merchant_statuses" AS ENUM (
  'online',
  'created',
  'offline',
  'shutdown'
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
  "name" hf.role_names UNIQUE NOT NULL,
  "merchant_id" integer
);

CREATE TABLE "hf"."users" (
  "id" serial PRIMARY KEY,
  "username" varchar NOT NULL,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now()),
  "phone_number" varchar,
  "email_domain_id" integer NOT NULL,
  "email_local_part" varchar(50) NOT NULL
);

CREATE TABLE "hf"."user_addresses" (
  "id" bigserial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "is_work_place" bool,
  "address_id" integer NOT NULL
);

CREATE TABLE "hf"."addresses" (
  "id" bigserial PRIMARY KEY,
  "phone_number" varchar(20) NOT NULL,
  "street_address" varchar(256) NOT NULL,
  "city_id" smallint NOT NULL,
  "province_id" smallint NOT NULL,
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
  "owner_id" integer,
  "status" hf.merchant_statuses,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now()),
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "opening_time_window" json,
  "offline_time_window" json
);

CREATE TABLE "hf"."merchant_contact_info" (
  "merchant_id" integer PRIMARY KEY,
  "zalo_id" varchar UNIQUE,
  "phone_number" varchar UNIQUE NOT NULL,
  "messenger_id" varchar UNIQUE,
  "facebook_fanpage_url" url UNIQUE
);

CREATE TABLE "hf"."merchant_addresses" (
  "id" bigserial PRIMARY KEY,
  "merchant_id" integer NOT NULL,
  "address_id" integer NOT NULL
);

CREATE TABLE "hf"."products" (
  "id" serial PRIMARY KEY,
  "name" varchar NOT NULL,
  "merchant_id" integer,
  "price" integer NOT NULL,
  "sale_off_price" integer,
  "disabled" bool,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now()),
  "category_id" integer,
  "quantity" smallint NOT NULL DEFAULT 0
);

CREATE TABLE "hf"."follows" (
  "following_user_id" integer NOT NULL,
  "followed_merchant_id" integer NOT NULL,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now())
);

CREATE TABLE "hf"."merchant_posts" (
  "id" serial PRIMARY KEY,
  "title" varchar,
  "content" text,
  "merchant_id" integer,
  "status" varchar,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now()),
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "hf"."product_categories" (
  "id" serial PRIMARY KEY,
  "name" varchar,
  "merchant_id" integer,
  "parent_id" integer UNIQUE
);

CREATE TABLE "hf"."orders" (
  "id" serial PRIMARY KEY,
  "item_ids" json,
  "customer_id" integer NOT NULL,
  "merchant_id" integer NOT NULL,
  "created_at" timestamptz UNIQUE NOT NULL DEFAULT (now()),
  "delivered_at" timestamptz,
  "done_at" timestamptz,
  "last_updated_at" timestamptz,
  "payment_status" hf.payment_status,
  "payment_method" hf.payment_method,
  "shipping_address_id" integer NOT NULL
);

CREATE TABLE "hf"."orderProducts" (
  "order_id" integer,
  "product_id" integer,
  "quantity" smallint,
  "note" text
);

CREATE TABLE "cities" (
  "id" smallserial PRIMARY KEY,
  "name" varchar,
  "province_id" smallint NOT NULL
);

CREATE TABLE "provinces" (
  "id" smallserial PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "email_domains" (
  "id" serial PRIMARY KEY,
  "domain_name" varchar UNIQUE NOT NULL
);

CREATE INDEX ON "hf"."users" ("id");

CREATE UNIQUE INDEX ON "hf"."users" ("email_domain_id", "email_local_part");

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

CREATE INDEX ON "hf"."orders" ("customer_id");

CREATE INDEX ON "hf"."orders" ("payment_status");

COMMENT ON COLUMN "hf"."user_addresses"."is_work_place" IS 'false for others';

COMMENT ON COLUMN "hf"."addresses"."coordinates" IS 'unused yet due to we don''t plan to become an F&B delivery service, integrated with Gmap APIs later';

COMMENT ON COLUMN "hf"."addresses"."note" IS 'noted by owner';

COMMENT ON COLUMN "hf"."merchants"."description" IS 'may not be used';

COMMENT ON COLUMN "hf"."merchants"."opening_time_window" IS 'format: [[<opened at>, <closed at>], <other days in week...>]';

COMMENT ON COLUMN "hf"."merchants"."offline_time_window" IS 'format: [<offline start time>, <reopen time>]';

COMMENT ON COLUMN "hf"."merchant_posts"."content" IS 'Content of the post';

COMMENT ON COLUMN "hf"."orders"."item_ids" IS 'TBD?????????????????';

COMMENT ON COLUMN "email_domains"."domain_name" IS 'gmail.com,duck.com,...';

ALTER TABLE "cities" ADD FOREIGN KEY ("province_id") REFERENCES "provinces" ("id");

ALTER TABLE "hf"."roles" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."users" ADD FOREIGN KEY ("email_domain_id") REFERENCES "email_domains" ("id");

ALTER TABLE "hf"."user_addresses" ADD FOREIGN KEY ("user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."user_addresses" ADD FOREIGN KEY ("address_id") REFERENCES "hf"."addresses" ("id");

ALTER TABLE "hf"."addresses" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "hf"."addresses" ADD FOREIGN KEY ("province_id") REFERENCES "provinces" ("id");

ALTER TABLE "hf"."user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "hf"."roles" ("id");

ALTER TABLE "hf"."users" ADD FOREIGN KEY ("id") REFERENCES "hf"."merchants" ("owner_id");

ALTER TABLE "hf"."merchants" ADD FOREIGN KEY ("id") REFERENCES "hf"."merchant_contact_info" ("merchant_id");

ALTER TABLE "hf"."merchant_addresses" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."merchant_addresses" ADD FOREIGN KEY ("address_id") REFERENCES "hf"."addresses" ("id");

ALTER TABLE "hf"."products" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."products" ADD FOREIGN KEY ("category_id") REFERENCES "hf"."product_categories" ("id");

ALTER TABLE "hf"."follows" ADD FOREIGN KEY ("following_user_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."follows" ADD FOREIGN KEY ("followed_merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."merchant_posts" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."product_categories" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."product_categories" ADD FOREIGN KEY ("parent_id") REFERENCES "hf"."product_categories" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("customer_id") REFERENCES "hf"."users" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants" ("id");

ALTER TABLE "hf"."orders" ADD FOREIGN KEY ("shipping_address_id") REFERENCES "hf"."user_addresses" ("id");

ALTER TABLE "hf"."orderProducts" ADD FOREIGN KEY ("order_id") REFERENCES "hf"."orders" ("id");

ALTER TABLE "hf"."orderProducts" ADD FOREIGN KEY ("product_id") REFERENCES "hf"."products" ("id");
