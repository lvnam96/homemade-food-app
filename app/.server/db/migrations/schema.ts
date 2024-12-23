import { pgTable, pgSchema, foreignKey, serial, integer, boolean, uniqueIndex, index, varchar, timestamp, unique, text, json, point, bigserial, numeric, smallint, primaryKey, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const hf = pgSchema("hf");
export const mediaTypeInHf = hf.enum("media_type", ['image', 'video', 'audio', 'pdf', 'other'])
export const merchantStatusInHf = hf.enum("merchant_status", ['online', 'created', 'offline', 'shutdown'])
export const paymentMethodInHf = hf.enum("payment_method", ['COD', 'online_banking'])
export const paymentStatusInHf = hf.enum("payment_status", ['unpaid', 'paying', 'error', 'paid'])
export const roleNameInHf = hf.enum("role_name", ['aDMin', 'created', 'merchant_owner', 'merchant_employee', 'merchant_customer', 'guest'])


export const userAddressesInHf = hf.table("user_addresses", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	isWorkPlace: boolean("is_work_place"),
	addressId: integer("address_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "user_addresses_user_id_fkey"
		}),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addressesInHf.id],
			name: "user_addresses_address_id_fkey"
		}),
]);

export const usersInHf = hf.table("users", {
	id: serial().primaryKey().notNull(),
	username: varchar().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	phoneNumber: varchar("phone_number"),
	emailDomainId: integer("email_domain_id").notNull(),
	emailLocalPart: varchar("email_local_part", { length: 50 }).notNull(),
}, (table) => [
	uniqueIndex("users_email_domain_id_email_local_part_idx").using("btree", table.emailDomainId.asc().nullsLast().op("int4_ops"), table.emailLocalPart.asc().nullsLast().op("int4_ops")),
	index("users_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.emailDomainId],
			foreignColumns: [emailDomains.id],
			name: "users_email_domain_id_fkey"
		}),
	foreignKey({
			columns: [table.id],
			foreignColumns: [merchantsInHf.ownerId],
			name: "users_id_fkey"
		}),
]);

export const merchantAddressesInHf = hf.table("merchant_addresses", {
	id: serial().primaryKey().notNull(),
	merchantId: integer("merchant_id").notNull(),
	addressId: integer("address_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addressesInHf.id],
			name: "merchant_addresses_address_id_fkey"
		}),
	unique("merchant_addresses_merchant_id_key").on(table.merchantId),
]);

export const merchantsInHf = hf.table("merchants", {
	id: serial().primaryKey().notNull(),
	name: varchar(),
	description: text(),
	ownerId: integer("owner_id").notNull(),
	status: merchantStatusInHf(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	openingTimeWindow: json("opening_time_window"),
	offlineTimeWindow: json("offline_time_window"),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [merchantContactInfoInHf.merchantId],
			name: "merchants_id_fkey"
		}),
	foreignKey({
			columns: [table.id],
			foreignColumns: [merchantAddressesInHf.merchantId],
			name: "merchants_id_fkey1"
		}),
	unique("merchants_owner_id_key").on(table.ownerId),
]);

export const addressesInHf = hf.table("addresses", {
	id: serial().primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	streetAddress: varchar("street_address", { length: 256 }).notNull(),
	districtId: varchar("district_id").notNull(),
	provinceId: varchar("province_id").notNull(),
	coordinates: point(),
	note: varchar({ length: 256 }),
}, (table) => [
	foreignKey({
			columns: [table.districtId],
			foreignColumns: [districts.code],
			name: "addresses_district_id_fkey"
		}),
	foreignKey({
			columns: [table.provinceId],
			foreignColumns: [provinces.code],
			name: "addresses_province_id_fkey"
		}),
]);

export const merchantContactInfoInHf = hf.table("merchant_contact_info", {
	id: serial().primaryKey().notNull(),
	merchantId: integer("merchant_id").notNull(),
	zaloId: varchar("zalo_id"),
	phoneNumber: varchar("phone_number").notNull(),
	messengerId: varchar("messenger_id"),
	facebookFanpageUrl: varchar("facebook_fanpage_url"),
}, (table) => [
	index("merchant_contact_info_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	unique("merchant_contact_info_merchant_id_key").on(table.merchantId),
	unique("merchant_contact_info_zalo_id_key").on(table.zaloId),
	unique("merchant_contact_info_phone_number_key").on(table.phoneNumber),
	unique("merchant_contact_info_messenger_id_key").on(table.messengerId),
	unique("merchant_contact_info_facebook_fanpage_url_key").on(table.facebookFanpageUrl),
]);

export const productMediaInHf = hf.table("product_media", {
	productId: integer("product_id").notNull(),
	mediaUrl: varchar("media_url").notNull(),
	type: mediaTypeInHf(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInHf.id],
			name: "product_media_product_id_fkey"
		}),
]);

export const discountsInHf = hf.table("discounts", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar().notNull(),
	discountPercent: numeric("discount_percent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	note: text(),
	merchantId: integer("merchant_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const followsInHf = hf.table("follows", {
	followingUserId: integer("following_user_id").notNull(),
	followedMerchantId: integer("followed_merchant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("follows_followed_merchant_id_idx").using("btree", table.followedMerchantId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("follows_following_user_id_followed_merchant_id_idx").using("btree", table.followingUserId.asc().nullsLast().op("int4_ops"), table.followedMerchantId.asc().nullsLast().op("int4_ops")),
	index("follows_following_user_id_idx").using("btree", table.followingUserId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.followingUserId],
			foreignColumns: [usersInHf.id],
			name: "follows_following_user_id_fkey"
		}),
	foreignKey({
			columns: [table.followedMerchantId],
			foreignColumns: [merchantsInHf.id],
			name: "follows_followed_merchant_id_fkey"
		}),
]);

export const productsInHf = hf.table("products", {
	id: serial().primaryKey().notNull(),
	sku: varchar({ length: 50 }).notNull(),
	name: varchar().notNull(),
	merchantId: integer("merchant_id").notNull(),
	price: integer().notNull(),
	discountId: integer("discount_id"),
	disabledAt: timestamp("disabled_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	categoryId: integer("category_id"),
	quantity: smallint().default(0).notNull(),
}, (table) => [
	index("products_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("products_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("products_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "products_merchant_id_fkey"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategoriesInHf.id],
			name: "products_category_id_fkey"
		}),
	foreignKey({
			columns: [table.discountId],
			foreignColumns: [discountsInHf.id],
			name: "products_discount_id_fkey"
		}),
	unique("products_sku_key").on(table.sku),
]);

export const merchantPostsInHf = hf.table("merchant_posts", {
	id: serial().primaryKey().notNull(),
	title: varchar().notNull(),
	content: text(),
	merchantId: integer("merchant_id"),
	status: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("merchant_posts_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("merchant_posts_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("merchant_posts_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("merchant_posts_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "merchant_posts_merchant_id_fkey"
		}),
]);

export const administrativeUnits = pgTable("administrative_units", {
	id: integer().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 255 }),
	fullNameEn: varchar("full_name_en", { length: 255 }),
	shortName: varchar("short_name", { length: 255 }),
	shortNameEn: varchar("short_name_en", { length: 255 }),
	codeName: varchar("code_name", { length: 255 }),
	codeNameEn: varchar("code_name_en", { length: 255 }),
});

export const districts = pgTable("districts", {
	code: varchar({ length: 20 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }),
	fullName: varchar("full_name", { length: 255 }),
	fullNameEn: varchar("full_name_en", { length: 255 }),
	codeName: varchar("code_name", { length: 255 }),
	provinceCode: varchar("province_code", { length: 20 }),
	administrativeUnitId: integer("administrative_unit_id"),
}, (table) => [
	index("idx_districts_province").using("btree", table.provinceCode.asc().nullsLast().op("text_ops")),
	index("idx_districts_unit").using("btree", table.administrativeUnitId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.administrativeUnitId],
			foreignColumns: [administrativeUnits.id],
			name: "districts_administrative_unit_id_fkey"
		}),
	foreignKey({
			columns: [table.provinceCode],
			foreignColumns: [provinces.code],
			name: "districts_province_code_fkey"
		}),
]);

export const productCategoriesInHf = hf.table("product_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	merchantId: integer("merchant_id").notNull(),
	parentId: integer("parent_id"),
}, (table) => [
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "product_categories_merchant_id_fkey"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "product_categories_parent_id_fkey"
		}),
	unique("product_categories_parent_id_key").on(table.parentId),
]);

export const ordersInHf = hf.table("orders", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	itemIds: json("item_ids"),
	userId: integer("user_id").notNull(),
	merchantId: integer("merchant_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	doneAt: timestamp("done_at", { withTimezone: true, mode: 'string' }),
	lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true, mode: 'string' }),
	paymentStatus: paymentStatusInHf("payment_status"),
	paymentMethod: paymentMethodInHf("payment_method"),
	shippingAddressId: integer("shipping_address_id").notNull(),
}, (table) => [
	index("orders_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("orders_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	index("orders_payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "orders_user_id_fkey"
		}),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "orders_merchant_id_fkey"
		}),
	foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [userAddressesInHf.id],
			name: "orders_shipping_address_id_fkey"
		}),
]);

export const administrativeRegions = pgTable("administrative_regions", {
	id: integer().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	codeName: varchar("code_name", { length: 255 }),
	codeNameEn: varchar("code_name_en", { length: 255 }),
});

export const emailDomains = pgTable("email_domains", {
	id: serial().primaryKey().notNull(),
	domainName: varchar("domain_name").notNull(),
}, (table) => [
	unique("email_domains_domain_name_key").on(table.domainName),
]);

export const provinces = pgTable("provinces", {
	code: varchar({ length: 20 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	fullNameEn: varchar("full_name_en", { length: 255 }),
	codeName: varchar("code_name", { length: 255 }),
	administrativeUnitId: integer("administrative_unit_id"),
	administrativeRegionId: integer("administrative_region_id"),
}, (table) => [
	index("idx_provinces_region").using("btree", table.administrativeRegionId.asc().nullsLast().op("int4_ops")),
	index("idx_provinces_unit").using("btree", table.administrativeUnitId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.administrativeRegionId],
			foreignColumns: [administrativeRegions.id],
			name: "provinces_administrative_region_id_fkey"
		}),
	foreignKey({
			columns: [table.administrativeUnitId],
			foreignColumns: [administrativeUnits.id],
			name: "provinces_administrative_unit_id_fkey"
		}),
]);

export const wards = pgTable("wards", {
	code: varchar({ length: 20 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }),
	fullName: varchar("full_name", { length: 255 }),
	fullNameEn: varchar("full_name_en", { length: 255 }),
	codeName: varchar("code_name", { length: 255 }),
	districtCode: varchar("district_code", { length: 20 }),
	administrativeUnitId: integer("administrative_unit_id"),
}, (table) => [
	index("idx_wards_district").using("btree", table.districtCode.asc().nullsLast().op("text_ops")),
	index("idx_wards_unit").using("btree", table.administrativeUnitId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.administrativeUnitId],
			foreignColumns: [administrativeUnits.id],
			name: "wards_administrative_unit_id_fkey"
		}),
	foreignKey({
			columns: [table.districtCode],
			foreignColumns: [districts.code],
			name: "wards_district_code_fkey"
		}),
]);

export const rolesInHf = hf.table("roles", {
	id: serial().primaryKey().notNull(),
	name: roleNameInHf().notNull(),
	merchantId: integer("merchant_id"),
}, (table) => [
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "roles_merchant_id_fkey"
		}),
	unique("roles_name_key").on(table.name),
]);

export const merchantPaymentMethodsInHf = hf.table("merchant_payment_methods", {
	merchantId: integer("merchant_id").notNull(),
	paymentMethod: paymentMethodInHf("payment_method").notNull(),
	note: varchar(),
}, (table) => [
	index("merchant_payment_methods_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "merchant_payment_methods_merchant_id_fkey"
		}),
]);

export const userRolesInHf = hf.table("user_roles", {
	userId: integer("user_id").notNull(),
	roleId: integer("role_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "user_roles_user_id_fkey"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [rolesInHf.id],
			name: "user_roles_role_id_fkey"
		}),
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_pkey"}),
]);

export const orderProductsInHf = hf.table("order_products", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	orderId: bigint("order_id", { mode: "number" }).notNull(),
	productId: integer("product_id").notNull(),
	quantity: smallint().notNull(),
	note: text(),
	originalPrice: integer("original_price").notNull(),
	soldPrice: integer("sold_price").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [ordersInHf.id],
			name: "order_products_order_id_fkey"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInHf.id],
			name: "order_products_product_id_fkey"
		}),
	primaryKey({ columns: [table.orderId, table.productId], name: "order_products_pkey"}),
]);
