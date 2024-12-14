import {
  pgTable,
  pgSchema,
  foreignKey,
  serial,
  integer,
  boolean,
  uniqueIndex,
  index,
  varchar,
  timestamp,
  unique,
  smallint,
  bigserial,
  numeric,
  text,
  json,
  point,
  primaryKey,
  bigint,
} from 'drizzle-orm/pg-core';

export const hf = pgSchema('hf');
export const mediaTypeInHf = hf.enum('media_type', ['image', 'video', 'audio', 'pdf', 'other']);
export const merchantStatusInHf = hf.enum('merchant_status', ['online', 'created', 'offline', 'shutdown']);
export const paymentMethodInHf = hf.enum('payment_method', ['COD', 'online_banking']);
export const paymentStatusInHf = hf.enum('payment_status', ['unpaid', 'paying', 'error', 'paid']);
export const roleNameInHf = hf.enum('role_name', [
  'aDMin',
  'created',
  'merchant_owner',
  'merchant_employee',
  'merchant_customer',
  'guest',
]);

export const userAddressesInHf = hf.table(
  'user_addresses',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    isWorkPlace: boolean('is_work_place'),
    addressId: integer('address_id').notNull(),
  },
  (table) => {
    return {
      userAddressesUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [usersInHf.id],
        name: 'user_addresses_user_id_fkey',
      }),
      userAddressesAddressIdFkey: foreignKey({
        columns: [table.addressId],
        foreignColumns: [addressesInHf.id],
        name: 'user_addresses_address_id_fkey',
      }),
    };
  },
);

export const usersInHf = hf.table(
  'users',
  {
    id: serial().primaryKey().notNull(),
    username: varchar().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    phoneNumber: varchar('phone_number'),
    emailDomainId: integer('email_domain_id').notNull(),
    emailLocalPart: varchar('email_local_part', { length: 50 }).notNull(),
  },
  (table) => {
    return {
      emailDomainIdEmailLocalPartIdx: uniqueIndex('users_email_domain_id_email_local_part_idx').using(
        'btree',
        table.emailDomainId.asc().nullsLast().op('int4_ops'),
        table.emailLocalPart.asc().nullsLast().op('int4_ops'),
      ),
      idIdx: index('users_id_idx').using('btree', table.id.asc().nullsLast().op('int4_ops')),
      usersEmailDomainIdFkey: foreignKey({
        columns: [table.emailDomainId],
        foreignColumns: [emailDomains.id],
        name: 'users_email_domain_id_fkey',
      }),
    };
  },
);

export const productsInHf = hf.table(
  'products',
  {
    id: serial().primaryKey().notNull(),
    sku: varchar({ length: 50 }).notNull(),
    name: varchar().notNull(),
    merchantId: integer('merchant_id').notNull(),
    price: integer().notNull(),
    discountId: integer('discount_id'),
    disabledAt: timestamp('disabled_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    categoryId: integer('category_id'),
    quantity: smallint().default(0).notNull(),
  },
  (table) => {
    return {
      categoryIdIdx: index('products_category_id_idx').using(
        'btree',
        table.categoryId.asc().nullsLast().op('int4_ops'),
      ),
      idIdx: index('products_id_idx').using('btree', table.id.asc().nullsLast().op('int4_ops')),
      merchantIdIdx: index('products_merchant_id_idx').using(
        'btree',
        table.merchantId.asc().nullsLast().op('int4_ops'),
      ),
      productsMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'products_merchant_id_fkey',
      }),
      productsCategoryIdFkey: foreignKey({
        columns: [table.categoryId],
        foreignColumns: [productCategoriesInHf.id],
        name: 'products_category_id_fkey',
      }),
      productsDiscountIdFkey: foreignKey({
        columns: [table.discountId],
        foreignColumns: [discountsInHf.id],
        name: 'products_discount_id_fkey',
      }),
      productsSkuKey: unique('products_sku_key').on(table.sku),
    };
  },
);

export const discountsInHf = hf.table('discounts', {
  id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
  name: varchar().notNull(),
  discountPercent: numeric('discount_percent'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  note: text(),
  merchantId: integer('merchant_id').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
});

export const merchantsInHf = hf.table('merchants', {
  id: serial().primaryKey().notNull(),
  name: varchar(),
  description: text(),
  ownerId: integer('owner_id'),
  status: merchantStatusInHf(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  openingTimeWindow: json('opening_time_window'),
  offlineTimeWindow: json('offline_time_window'),
});

export const addressesInHf = hf.table(
  'addresses',
  {
    id: serial().primaryKey().notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    streetAddress: varchar('street_address', { length: 256 }).notNull(),
    districtId: varchar('district_id').notNull(),
    provinceId: varchar('province_id').notNull(),
    coordinates: point(),
    note: varchar({ length: 256 }),
  },
  (table) => {
    return {
      addressesDistrictIdFkey: foreignKey({
        columns: [table.districtId],
        foreignColumns: [districts.code],
        name: 'addresses_district_id_fkey',
      }),
      addressesProvinceIdFkey: foreignKey({
        columns: [table.provinceId],
        foreignColumns: [provinces.code],
        name: 'addresses_province_id_fkey',
      }),
    };
  },
);

export const merchantAddressesInHf = hf.table(
  'merchant_addresses',
  {
    id: serial().primaryKey().notNull(),
    merchantId: integer('merchant_id').notNull(),
    addressId: integer('address_id').notNull(),
  },
  (table) => {
    return {
      merchantAddressesAddressIdFkey: foreignKey({
        columns: [table.addressId],
        foreignColumns: [addressesInHf.id],
        name: 'merchant_addresses_address_id_fkey',
      }),
    };
  },
);

export const merchantPaymentMethodsInHf = hf.table(
  'merchant_payment_methods',
  {
    merchantId: integer('merchant_id').notNull(),
    paymentMethod: paymentMethodInHf('payment_method').notNull(),
    note: varchar(),
  },
  (table) => {
    return {
      merchantPaymentMethodsMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'merchant_payment_methods_merchant_id_fkey',
      }),
    };
  },
);

export const followsInHf = hf.table(
  'follows',
  {
    followingUserId: integer('following_user_id').notNull(),
    followedMerchantId: integer('followed_merchant_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      followedMerchantIdIdx: index('follows_followed_merchant_id_idx').using(
        'btree',
        table.followedMerchantId.asc().nullsLast().op('int4_ops'),
      ),
      followingUserIdFollowedMerchantIdIdx: uniqueIndex('follows_following_user_id_followed_merchant_id_idx').using(
        'btree',
        table.followingUserId.asc().nullsLast().op('int4_ops'),
        table.followedMerchantId.asc().nullsLast().op('int4_ops'),
      ),
      followingUserIdIdx: index('follows_following_user_id_idx').using(
        'btree',
        table.followingUserId.asc().nullsLast().op('int4_ops'),
      ),
      followsFollowingUserIdFkey: foreignKey({
        columns: [table.followingUserId],
        foreignColumns: [usersInHf.id],
        name: 'follows_following_user_id_fkey',
      }),
      followsFollowedMerchantIdFkey: foreignKey({
        columns: [table.followedMerchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'follows_followed_merchant_id_fkey',
      }),
    };
  },
);

export const productMediaInHf = hf.table(
  'product_media',
  {
    productId: integer('product_id').notNull(),
    mediaUrl: varchar('media_url').notNull(),
    type: mediaTypeInHf(),
  },
  (table) => {
    return {
      productMediaProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [productsInHf.id],
        name: 'product_media_product_id_fkey',
      }),
    };
  },
);

export const productCategoriesInHf = hf.table(
  'product_categories',
  {
    id: serial().primaryKey().notNull(),
    name: varchar().notNull(),
    merchantId: integer('merchant_id').notNull(),
    parentId: integer('parent_id'),
  },
  (table) => {
    return {
      productCategoriesMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'product_categories_merchant_id_fkey',
      }),
      productCategoriesParentIdFkey: foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
        name: 'product_categories_parent_id_fkey',
      }),
      productCategoriesParentIdKey: unique('product_categories_parent_id_key').on(table.parentId),
    };
  },
);

export const merchantPostsInHf = hf.table(
  'merchant_posts',
  {
    id: serial().primaryKey().notNull(),
    title: varchar().notNull(),
    content: text(),
    merchantId: integer('merchant_id'),
    status: varchar(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => {
    return {
      idIdx: index('merchant_posts_id_idx').using('btree', table.id.asc().nullsLast().op('int4_ops')),
      merchantIdIdx: index('merchant_posts_merchant_id_idx').using(
        'btree',
        table.merchantId.asc().nullsLast().op('int4_ops'),
      ),
      statusIdx: index('merchant_posts_status_idx').using('btree', table.status.asc().nullsLast().op('text_ops')),
      titleIdx: index('merchant_posts_title_idx').using('btree', table.title.asc().nullsLast().op('text_ops')),
      merchantPostsMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'merchant_posts_merchant_id_fkey',
      }),
    };
  },
);

export const ordersInHf = hf.table(
  'orders',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    itemIds: json('item_ids'),
    userId: integer('user_id').notNull(),
    merchantId: integer('merchant_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),
    doneAt: timestamp('done_at', { withTimezone: true, mode: 'string' }),
    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true, mode: 'string' }),
    paymentStatus: paymentStatusInHf('payment_status'),
    paymentMethod: paymentMethodInHf('payment_method'),
    shippingAddressId: integer('shipping_address_id').notNull(),
  },
  (table) => {
    return {
      idIdx: index('orders_id_idx').using('btree', table.id.asc().nullsLast().op('int8_ops')),
      merchantIdIdx: index('orders_merchant_id_idx').using('btree', table.merchantId.asc().nullsLast().op('int4_ops')),
      paymentStatusIdx: index('orders_payment_status_idx').using(
        'btree',
        table.paymentStatus.asc().nullsLast().op('enum_ops'),
      ),
      userIdIdx: index('orders_user_id_idx').using('btree', table.userId.asc().nullsLast().op('int4_ops')),
      ordersUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [usersInHf.id],
        name: 'orders_user_id_fkey',
      }),
      ordersMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'orders_merchant_id_fkey',
      }),
      ordersShippingAddressIdFkey: foreignKey({
        columns: [table.shippingAddressId],
        foreignColumns: [userAddressesInHf.id],
        name: 'orders_shipping_address_id_fkey',
      }),
    };
  },
);

export const administrativeUnits = pgTable('administrative_units', {
  id: integer().primaryKey().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  fullNameEn: varchar('full_name_en', { length: 255 }),
  shortName: varchar('short_name', { length: 255 }),
  shortNameEn: varchar('short_name_en', { length: 255 }),
  codeName: varchar('code_name', { length: 255 }),
  codeNameEn: varchar('code_name_en', { length: 255 }),
});

export const districts = pgTable(
  'districts',
  {
    code: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    provinceCode: varchar('province_code', { length: 20 }),
    administrativeUnitId: integer('administrative_unit_id'),
  },
  (table) => {
    return {
      idxDistrictsProvince: index('idx_districts_province').using(
        'btree',
        table.provinceCode.asc().nullsLast().op('text_ops'),
      ),
      idxDistrictsUnit: index('idx_districts_unit').using(
        'btree',
        table.administrativeUnitId.asc().nullsLast().op('int4_ops'),
      ),
      districtsAdministrativeUnitIdFkey: foreignKey({
        columns: [table.administrativeUnitId],
        foreignColumns: [administrativeUnits.id],
        name: 'districts_administrative_unit_id_fkey',
      }),
      districtsProvinceCodeFkey: foreignKey({
        columns: [table.provinceCode],
        foreignColumns: [provinces.code],
        name: 'districts_province_code_fkey',
      }),
    };
  },
);

export const wards = pgTable(
  'wards',
  {
    code: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    districtCode: varchar('district_code', { length: 20 }),
    administrativeUnitId: integer('administrative_unit_id'),
  },
  (table) => {
    return {
      idxWardsDistrict: index('idx_wards_district').using('btree', table.districtCode.asc().nullsLast().op('text_ops')),
      idxWardsUnit: index('idx_wards_unit').using('btree', table.administrativeUnitId.asc().nullsLast().op('int4_ops')),
      wardsAdministrativeUnitIdFkey: foreignKey({
        columns: [table.administrativeUnitId],
        foreignColumns: [administrativeUnits.id],
        name: 'wards_administrative_unit_id_fkey',
      }),
      wardsDistrictCodeFkey: foreignKey({
        columns: [table.districtCode],
        foreignColumns: [districts.code],
        name: 'wards_district_code_fkey',
      }),
    };
  },
);

export const emailDomains = pgTable(
  'email_domains',
  {
    id: serial().primaryKey().notNull(),
    domainName: varchar('domain_name').notNull(),
  },
  (table) => {
    return {
      emailDomainsDomainNameKey: unique('email_domains_domain_name_key').on(table.domainName),
    };
  },
);

export const administrativeRegions = pgTable('administrative_regions', {
  id: integer().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  codeName: varchar('code_name', { length: 255 }),
  codeNameEn: varchar('code_name_en', { length: 255 }),
});

export const provinces = pgTable(
  'provinces',
  {
    code: varchar({ length: 20 }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    administrativeUnitId: integer('administrative_unit_id'),
    administrativeRegionId: integer('administrative_region_id'),
  },
  (table) => {
    return {
      idxProvincesRegion: index('idx_provinces_region').using(
        'btree',
        table.administrativeRegionId.asc().nullsLast().op('int4_ops'),
      ),
      idxProvincesUnit: index('idx_provinces_unit').using(
        'btree',
        table.administrativeUnitId.asc().nullsLast().op('int4_ops'),
      ),
      provincesAdministrativeRegionIdFkey: foreignKey({
        columns: [table.administrativeRegionId],
        foreignColumns: [administrativeRegions.id],
        name: 'provinces_administrative_region_id_fkey',
      }),
      provincesAdministrativeUnitIdFkey: foreignKey({
        columns: [table.administrativeUnitId],
        foreignColumns: [administrativeUnits.id],
        name: 'provinces_administrative_unit_id_fkey',
      }),
    };
  },
);

export const rolesInHf = hf.table(
  'roles',
  {
    id: serial().primaryKey().notNull(),
    name: roleNameInHf().notNull(),
    merchantId: integer('merchant_id'),
  },
  (table) => {
    return {
      rolesMerchantIdFkey: foreignKey({
        columns: [table.merchantId],
        foreignColumns: [merchantsInHf.id],
        name: 'roles_merchant_id_fkey',
      }),
      rolesNameKey: unique('roles_name_key').on(table.name),
    };
  },
);

export const userRolesInHf = hf.table(
  'user_roles',
  {
    userId: integer('user_id').notNull(),
    roleId: integer('role_id').notNull(),
  },
  (table) => {
    return {
      userRolesUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [usersInHf.id],
        name: 'user_roles_user_id_fkey',
      }),
      userRolesRoleIdFkey: foreignKey({
        columns: [table.roleId],
        foreignColumns: [rolesInHf.id],
        name: 'user_roles_role_id_fkey',
      }),
      userRolesPkey: primaryKey({ columns: [table.userId, table.roleId], name: 'user_roles_pkey' }),
    };
  },
);

export const orderProductsInHf = hf.table(
  'order_products',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    orderId: bigint('order_id', { mode: 'number' }).notNull(),
    productId: integer('product_id').notNull(),
    quantity: smallint().notNull(),
    note: text(),
    originalPrice: integer('original_price').notNull(),
    soldPrice: integer('sold_price').notNull(),
  },
  (table) => {
    return {
      orderProductsOrderIdFkey: foreignKey({
        columns: [table.orderId],
        foreignColumns: [ordersInHf.id],
        name: 'order_products_order_id_fkey',
      }),
      orderProductsProductIdFkey: foreignKey({
        columns: [table.productId],
        foreignColumns: [productsInHf.id],
        name: 'order_products_product_id_fkey',
      }),
      orderProductsPkey: primaryKey({ columns: [table.orderId, table.productId], name: 'order_products_pkey' }),
    };
  },
);
