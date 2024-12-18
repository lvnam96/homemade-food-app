CREATE SCHEMA "hf";

CREATE TYPE "hf"."media_type" AS ENUM('image', 'video', 'audio', 'pdf', 'other');
CREATE TYPE "hf"."merchant_status" AS ENUM('online', 'created', 'offline', 'shutdown');
CREATE TYPE "hf"."payment_method" AS ENUM('COD', 'online_banking');
CREATE TYPE "hf"."payment_status" AS ENUM('unpaid', 'paying', 'error', 'paid');
CREATE TYPE "hf"."role_name" AS ENUM('aDMin', 'created', 'merchant_owner', 'merchant_employee', 'merchant_customer', 'guest');
CREATE TABLE "hf"."addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"street_address" varchar(256) NOT NULL,
	"district_id" varchar NOT NULL,
	"province_id" varchar NOT NULL,
	"coordinates" "point",
	"note" varchar(256)
);

CREATE TABLE "administrative_regions" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"code_name" varchar(255),
	"code_name_en" varchar(255)
);

CREATE TABLE "administrative_units" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"full_name_en" varchar(255),
	"short_name" varchar(255),
	"short_name_en" varchar(255),
	"code_name" varchar(255),
	"code_name_en" varchar(255)
);

CREATE TABLE "hf"."discounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"discount_percent" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"merchant_id" integer NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "districts" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"full_name" varchar(255),
	"full_name_en" varchar(255),
	"code_name" varchar(255),
	"province_code" varchar(20),
	"administrative_unit_id" integer
);

CREATE TABLE "email_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_name" varchar NOT NULL,
	CONSTRAINT "email_domains_domain_name_key" UNIQUE("domain_name")
);

CREATE TABLE "hf"."follows" (
	"following_user_id" integer NOT NULL,
	"followed_merchant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "hf"."merchant_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"address_id" integer NOT NULL
);

CREATE TABLE "hf"."merchant_payment_methods" (
	"merchant_id" integer NOT NULL,
	"payment_method" "hf"."payment_method" NOT NULL,
	"note" varchar
);

CREATE TABLE "hf"."merchant_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" text,
	"merchant_id" integer,
	"status" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "hf"."merchants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"description" text,
	"owner_id" integer,
	"status" "hf"."merchant_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"opening_time_window" json,
	"offline_time_window" json
);

CREATE TABLE "hf"."order_products" (
	"order_id" bigint NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" smallint NOT NULL,
	"note" text,
	"original_price" integer NOT NULL,
	"sold_price" integer NOT NULL,
	CONSTRAINT "order_products_pkey" PRIMARY KEY("order_id","product_id")
);

CREATE TABLE "hf"."orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"item_ids" json,
	"user_id" integer NOT NULL,
	"merchant_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"done_at" timestamp with time zone,
	"last_updated_at" timestamp with time zone,
	"payment_status" "hf"."payment_status",
	"payment_method" "hf"."payment_method",
	"shipping_address_id" integer NOT NULL
);

CREATE TABLE "hf"."product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"merchant_id" integer NOT NULL,
	"parent_id" integer,
	CONSTRAINT "product_categories_parent_id_key" UNIQUE("parent_id")
);

CREATE TABLE "hf"."product_media" (
	"product_id" integer NOT NULL,
	"media_url" varchar NOT NULL,
	"type" "hf"."media_type"
);

CREATE TABLE "hf"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(50) NOT NULL,
	"name" varchar NOT NULL,
	"merchant_id" integer NOT NULL,
	"price" integer NOT NULL,
	"discount_id" integer,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category_id" integer,
	"quantity" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "products_sku_key" UNIQUE("sku")
);

CREATE TABLE "provinces" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"full_name_en" varchar(255),
	"code_name" varchar(255),
	"administrative_unit_id" integer,
	"administrative_region_id" integer
);

CREATE TABLE "hf"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "hf"."role_name" NOT NULL,
	"merchant_id" integer,
	CONSTRAINT "roles_name_key" UNIQUE("name")
);

CREATE TABLE "hf"."user_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_work_place" boolean,
	"address_id" integer NOT NULL
);

CREATE TABLE "hf"."user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "user_roles_pkey" PRIMARY KEY("user_id","role_id")
);

CREATE TABLE "hf"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"phone_number" varchar,
	"email_domain_id" integer NOT NULL,
	"email_local_part" varchar(50) NOT NULL
);

CREATE TABLE "wards" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"full_name" varchar(255),
	"full_name_en" varchar(255),
	"code_name" varchar(255),
	"district_code" varchar(20),
	"administrative_unit_id" integer
);

ALTER TABLE "hf"."addresses" ADD CONSTRAINT "addresses_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("code") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."addresses" ADD CONSTRAINT "addresses_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("code") ON DELETE no action ON UPDATE no action;
ALTER TABLE "districts" ADD CONSTRAINT "districts_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "public"."administrative_units"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "public"."provinces"("code") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."follows" ADD CONSTRAINT "follows_following_user_id_fkey" FOREIGN KEY ("following_user_id") REFERENCES "hf"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."follows" ADD CONSTRAINT "follows_followed_merchant_id_fkey" FOREIGN KEY ("followed_merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."merchant_addresses" ADD CONSTRAINT "merchant_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "hf"."addresses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."merchant_payment_methods" ADD CONSTRAINT "merchant_payment_methods_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."merchant_posts" ADD CONSTRAINT "merchant_posts_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."order_products" ADD CONSTRAINT "order_products_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "hf"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."order_products" ADD CONSTRAINT "order_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "hf"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hf"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."orders" ADD CONSTRAINT "orders_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "hf"."user_addresses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."product_categories" ADD CONSTRAINT "product_categories_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hf"."product_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "hf"."products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."products" ADD CONSTRAINT "products_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hf"."product_categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."products" ADD CONSTRAINT "products_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "hf"."discounts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_region_id_fkey" FOREIGN KEY ("administrative_region_id") REFERENCES "public"."administrative_regions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "public"."administrative_units"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."roles" ADD CONSTRAINT "roles_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "hf"."merchants"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hf"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."user_addresses" ADD CONSTRAINT "user_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "hf"."addresses"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hf"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "hf"."roles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "hf"."users" ADD CONSTRAINT "users_email_domain_id_fkey" FOREIGN KEY ("email_domain_id") REFERENCES "public"."email_domains"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wards" ADD CONSTRAINT "wards_administrative_unit_id_fkey" FOREIGN KEY ("administrative_unit_id") REFERENCES "public"."administrative_units"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wards" ADD CONSTRAINT "wards_district_code_fkey" FOREIGN KEY ("district_code") REFERENCES "public"."districts"("code") ON DELETE no action ON UPDATE no action;
CREATE INDEX "idx_districts_province" ON "districts" USING btree ("province_code" text_ops);
CREATE INDEX "idx_districts_unit" ON "districts" USING btree ("administrative_unit_id" int4_ops);
CREATE INDEX "follows_followed_merchant_id_idx" ON "hf"."follows" USING btree ("followed_merchant_id" int4_ops);
CREATE UNIQUE INDEX "follows_following_user_id_followed_merchant_id_idx" ON "hf"."follows" USING btree ("following_user_id" int4_ops,"followed_merchant_id" int4_ops);
CREATE INDEX "follows_following_user_id_idx" ON "hf"."follows" USING btree ("following_user_id" int4_ops);
CREATE INDEX "merchant_posts_id_idx" ON "hf"."merchant_posts" USING btree ("id" int4_ops);
CREATE INDEX "merchant_posts_merchant_id_idx" ON "hf"."merchant_posts" USING btree ("merchant_id" int4_ops);
CREATE INDEX "merchant_posts_status_idx" ON "hf"."merchant_posts" USING btree ("status" text_ops);
CREATE INDEX "merchant_posts_title_idx" ON "hf"."merchant_posts" USING btree ("title" text_ops);
CREATE INDEX "orders_id_idx" ON "hf"."orders" USING btree ("id" int8_ops);
CREATE INDEX "orders_merchant_id_idx" ON "hf"."orders" USING btree ("merchant_id" int4_ops);
CREATE INDEX "orders_payment_status_idx" ON "hf"."orders" USING btree ("payment_status" enum_ops);
CREATE INDEX "orders_user_id_idx" ON "hf"."orders" USING btree ("user_id" int4_ops);
CREATE INDEX "products_category_id_idx" ON "hf"."products" USING btree ("category_id" int4_ops);
CREATE INDEX "products_id_idx" ON "hf"."products" USING btree ("id" int4_ops);
CREATE INDEX "products_merchant_id_idx" ON "hf"."products" USING btree ("merchant_id" int4_ops);
CREATE INDEX "idx_provinces_region" ON "provinces" USING btree ("administrative_region_id" int4_ops);
CREATE INDEX "idx_provinces_unit" ON "provinces" USING btree ("administrative_unit_id" int4_ops);
CREATE UNIQUE INDEX "users_email_domain_id_email_local_part_idx" ON "hf"."users" USING btree ("email_domain_id" int4_ops,"email_local_part" int4_ops);
CREATE INDEX "users_id_idx" ON "hf"."users" USING btree ("id" int4_ops);
CREATE INDEX "idx_wards_district" ON "wards" USING btree ("district_code" text_ops);
CREATE INDEX "idx_wards_unit" ON "wards" USING btree ("administrative_unit_id" int4_ops);