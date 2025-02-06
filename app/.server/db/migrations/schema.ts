import { pgTable, pgSchema, index, foreignKey, bigserial, bigint, timestamp, unique, varchar, text, json, uniqueIndex, integer, point, serial, smallint, numeric, primaryKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const hf = pgSchema("hf");
export const mediaTypeInHf = hf.enum("media_type", ['image', 'video', 'audio', 'pdf', 'other'])
export const merchantStatusInHf = hf.enum("merchant_status", ['online', 'created', 'offline', 'shutdown'])
export const paymentMethodInHf = hf.enum("payment_method", ['COD', 'online_banking'])
export const paymentStatusInHf = hf.enum("payment_status", ['unpaid', 'paying', 'error', 'paid'])
export const roleNameInHf = hf.enum("role_name", ['aDMin', 'created', 'merchant_owner', 'merchant_employee', 'merchant_customer', 'guest'])
export const verificationTypeInHf = hf.enum("verification_type", ['email', 'phone'])


export const authSessionsInHf = hf.table("auth_sessions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigint("user_id", { mode: "bigint" }),
	expiredAt: timestamp("expired_at", { withTimezone: true, mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("auth_sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "auth_sessions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const merchantsInHf = hf.table("merchants", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar().notNull(),
	description: text(),
	ownerId: bigint("owner_id", { mode: "bigint" }).notNull(),
	status: merchantStatusInHf().notNull(),
	openingTimeWindow: json("opening_time_window"),
	offlineTimeWindow: json("offline_time_window"),
	addressId: bigint("address_id", { mode: "bigint" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("merchants_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("merchants_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [usersInHf.id],
			name: "merchants_owner_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addressesInHf.id],
			name: "merchants_address_id_fkey"
		}).onDelete("cascade"),
	unique("merchants_owner_id_key").on(table.ownerId),
]);

export const authVerificationsInHf = hf.table("auth_verifications", {
	id: text().primaryKey().notNull(),
	type: verificationTypeInHf().notNull(),
	target: text().notNull(),
	secret: text().notNull(),
	algorithm: text().notNull(),
	digits: integer().notNull(),
	period: integer().notNull(),
	charSet: text("char_set").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	expiredAt: timestamp("expired_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	uniqueIndex("auth_verifications_target_type_idx").using("btree", table.target.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("text_ops")),
]);

export const usersInHf = hf.table("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	displayedName: varchar("displayed_name").notNull(),
	merchantId: bigint("merchant_id", { mode: "bigint" }),
	phoneNumber: varchar("phone_number"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("users_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("users_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	unique("users_merchant_id_key").on(table.merchantId),
]);

export const addressesInHf = hf.table("addresses", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	streetAddress: varchar("street_address", { length: 256 }).notNull(),
	districtId: varchar("district_id").notNull(),
	provinceId: varchar("province_id").notNull(),
	coordinates: point(),
	note: varchar({ length: 256 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.districtId],
			foreignColumns: [districts.code],
			name: "addresses_district_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.provinceId],
			foreignColumns: [provinces.code],
			name: "addresses_province_id_fkey"
		}).onDelete("restrict"),
]);

export const rolesInHf = hf.table("roles", {
	id: serial().primaryKey().notNull(),
	name: roleNameInHf().notNull(),
}, (table) => [
	unique("roles_name_key").on(table.name),
]);

export const merchantContactInfoInHf = hf.table("merchant_contact_info", {
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	zaloId: varchar("zalo_id"),
	phoneNumber: varchar("phone_number").notNull(),
	messengerId: varchar("messenger_id"),
	facebookFanpageUrl: varchar("facebook_fanpage_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("merchant_contact_info_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "merchant_contact_info_merchant_id_fkey"
		}).onDelete("cascade"),
	unique("merchant_contact_info_merchant_id_key").on(table.merchantId),
	unique("merchant_contact_info_zalo_id_key").on(table.zaloId),
	unique("merchant_contact_info_phone_number_key").on(table.phoneNumber),
	unique("merchant_contact_info_messenger_id_key").on(table.messengerId),
	unique("merchant_contact_info_facebook_fanpage_url_key").on(table.facebookFanpageUrl),
]);

export const merchantPostsInHf = hf.table("merchant_posts", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: varchar().notNull(),
	content: text(),
	merchantId: bigint("merchant_id", { mode: "bigint" }),
	status: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("merchant_posts_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("merchant_posts_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	index("merchant_posts_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("merchant_posts_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "merchant_posts_merchant_id_fkey"
		}).onDelete("cascade"),
]);

export const merchantPaymentMethodsInHf = hf.table("merchant_payment_methods", {
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	paymentMethod: paymentMethodInHf("payment_method").notNull(),
	note: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("merchant_payment_methods_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "merchant_payment_methods_merchant_id_fkey"
		}).onDelete("cascade"),
]);

export const productsInHf = hf.table("products", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	sku: varchar({ length: 50 }).notNull(),
	name: varchar().notNull(),
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	price: integer().notNull(),
	discountId: bigint("discount_id", { mode: "bigint" }),
	quantity: smallint().default(0).notNull(),
	disabledAt: timestamp("disabled_at", { withTimezone: true, mode: 'date' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("products_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("products_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "products_merchant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.discountId],
			foreignColumns: [discountsInHf.id],
			name: "products_discount_id_fkey"
		}).onDelete("restrict"),
	unique("products_sku_key").on(table.sku),
]);

export const followsInHf = hf.table("follows", {
	followingUserId: bigint("following_user_id", { mode: "bigint" }).notNull(),
	followedMerchantId: bigint("followed_merchant_id", { mode: "bigint" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	index("follows_followed_merchant_id_idx").using("btree", table.followedMerchantId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("follows_following_user_id_followed_merchant_id_idx").using("btree", table.followingUserId.asc().nullsLast().op("int8_ops"), table.followedMerchantId.asc().nullsLast().op("int8_ops")),
	index("follows_following_user_id_idx").using("btree", table.followingUserId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.followingUserId],
			foreignColumns: [usersInHf.id],
			name: "follows_following_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followedMerchantId],
			foreignColumns: [merchantsInHf.id],
			name: "follows_followed_merchant_id_fkey"
		}).onDelete("cascade"),
]);

export const ordersInHf = hf.table("orders", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigint("user_id", { mode: "bigint" }).notNull(),
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	paymentStatus: paymentStatusInHf("payment_status").notNull(),
	paymentMethod: paymentMethodInHf("payment_method").notNull(),
	shippingAddressId: bigint("shipping_address_id", { mode: "bigint" }).notNull(),
	discountId: bigint("discount_id", { mode: "bigint" }),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'date' }),
	doneAt: timestamp("done_at", { withTimezone: true, mode: 'date' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("orders_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	index("orders_merchant_id_idx").using("btree", table.merchantId.asc().nullsLast().op("int8_ops")),
	index("orders_payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast().op("enum_ops")),
	index("orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.discountId],
			foreignColumns: [discountsInHf.id],
			name: "orders_discount_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "orders_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "orders_merchant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [shippingAddressesInHf.id],
			name: "orders_shipping_address_id_fkey"
		}).onDelete("restrict"),
]);

export const orderItemsInHf = hf.table("order_items", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	orderId: bigint("order_id", { mode: "bigint" }).notNull(),
	productId: bigint("product_id", { mode: "bigint" }).notNull(),
	quantity: smallint().notNull(),
	note: text(),
	originalPrice: integer("original_price").notNull(),
	soldPrice: integer("sold_price").notNull(),
	discountAmount: numeric("discount_amount"),
}, (table) => [
	index("order_items_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("int8_ops")),
	index("order_items_product_id_idx").using("btree", table.productId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [ordersInHf.id],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInHf.id],
			name: "order_items_product_id_fkey"
		}).onDelete("cascade"),
]);

export const productMediaInHf = hf.table("product_media", {
	productId: bigint("product_id", { mode: "bigint" }).notNull(),
	mediaUrl: varchar("media_url").notNull(),
	type: mediaTypeInHf().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInHf.id],
			name: "product_media_product_id_fkey"
		}).onDelete("cascade"),
]);

export const productCategoriesInHf = hf.table("product_categories", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar().notNull(),
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	parentId: bigint("parent_id", { mode: "bigint" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchantsInHf.id],
			name: "product_categories_merchant_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "product_categories_parent_id_fkey"
		}).onDelete("restrict"),
	unique("product_categories_parent_id_key").on(table.parentId),
]);

export const administrativeRegions = pgTable("administrative_regions", {
	id: integer().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	codeName: varchar("code_name", { length: 255 }),
	codeNameEn: varchar("code_name_en", { length: 255 }),
});

export const shippingAddressesInHf = hf.table("shipping_addresses", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	streetAddress: varchar("street_address", { length: 256 }).notNull(),
	districtId: varchar("district_id").notNull(),
	provinceId: varchar("province_id").notNull(),
	coordinates: point(),
	note: varchar({ length: 256 }),
});

export const administrativeUnits = pgTable("administrative_units", {
	id: integer().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 255 }),
	fullNameEn: varchar("full_name_en", { length: 255 }),
	shortName: varchar("short_name", { length: 255 }),
	shortNameEn: varchar("short_name_en", { length: 255 }),
	codeName: varchar("code_name", { length: 255 }),
	codeNameEn: varchar("code_name_en", { length: 255 }),
});

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

export const userCredentialsInHf = hf.table("user_credentials", {
	userId: bigint("user_id", { mode: "bigint" }).notNull(),
	email: varchar().notNull(),
	password: varchar().notNull(),
	salt: varchar().notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'date' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	index("user_credentials_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("user_credentials_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "user_credentials_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_credentials_user_id_key").on(table.userId),
	unique("user_credentials_email_key").on(table.email),
]);

export const discountsInHf = hf.table("discounts", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar().notNull(),
	discountPercent: numeric("discount_percent"),
	note: text(),
	merchantId: bigint("merchant_id", { mode: "bigint" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
});

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

export const productsToCategoriesInHf = hf.table("products_to_categories", {
	productId: bigint("product_id", { mode: "bigint" }).notNull(),
	categoryId: bigint("category_id", { mode: "bigint" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInHf.id],
			name: "products_to_categories_product_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategoriesInHf.id],
			name: "products_to_categories_category_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.categoryId], name: "products_to_categories_pkey"}),
]);

export const userAddressesInHf = hf.table("user_addresses", {
	userId: bigint("user_id", { mode: "bigint" }).notNull(),
	isWorkPlace: boolean("is_work_place"),
	addressId: bigint("address_id", { mode: "bigint" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "user_addresses_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addressesInHf.id],
			name: "user_addresses_address_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.userId, table.addressId], name: "user_addresses_pkey"}),
]);

export const userRolesInHf = hf.table("user_roles", {
	userId: bigint("user_id", { mode: "bigint" }).notNull(),
	roleId: integer("role_id").notNull(),
	assignedBy: bigint("assigned_by", { mode: "bigint" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	index("user_roles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInHf.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [usersInHf.id],
			name: "user_roles_assigned_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [rolesInHf.id],
			name: "user_roles_role_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_pkey"}),
]);
