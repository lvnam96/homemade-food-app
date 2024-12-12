// Drizzle schema implementation based on `../sql/vietnamese-admin-units-schema.sql`

import { index, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const administrativeRegionsTable = pgTable('administrative_regions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  codeName: varchar('code_name', { length: 255 }),
  codeNameEn: varchar('code_name_en', { length: 255 }),
});

export const administrativeUnitsTable = pgTable('administrative_units', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }),
  fullNameEn: varchar('full_name_en', { length: 255 }),
  shortName: varchar('short_name', { length: 255 }),
  shortNameEn: varchar('short_name_en', { length: 255 }),
  codeName: varchar('code_name', { length: 255 }),
  codeNameEn: varchar('code_name_en', { length: 255 }),
});

export const provincesTable = pgTable(
  'provinces',
  {
    code: varchar('code', { length: 20 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    administrativeUnitId: serial('administrative_unit_id').references(() => administrativeUnitsTable.id),
    administrativeRegionId: serial('administrative_region_id').references(() => administrativeRegionsTable.id),
  },
  (t) => [
    index('idx_provinces_region').onOnly(t.administrativeRegionId),
    index('idx_provinces_unit').onOnly(t.administrativeUnitId),
  ],
);

export const districtsTable = pgTable(
  'districts',
  {
    code: varchar('code', { length: 20 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    provinceCode: varchar('province_code', { length: 20 }).references(() => provincesTable.code),
    administrativeUnitId: integer('administrative_unit_id').references(() => administrativeUnitsTable.id),
  },
  (t) => [
    index('idx_districts_province').onOnly(t.provinceCode),
    index('idx_districts_unit').onOnly(t.administrativeUnitId),
  ],
);

export const wardsTable = pgTable(
  'wards',
  {
    code: varchar('code', { length: 20 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }),
    fullNameEn: varchar('full_name_en', { length: 255 }),
    codeName: varchar('code_name', { length: 255 }),
    districtCode: varchar('district_code', { length: 20 }).references(() => districtsTable.code),
    administrativeUnitId: integer('administrative_unit_id').references(() => administrativeUnitsTable.id),
  },
  (t) => [index('idx_wards_district').onOnly(t.districtCode), index('idx_wards_unit').onOnly(t.administrativeUnitId)],
);
