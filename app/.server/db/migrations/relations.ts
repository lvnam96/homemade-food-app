import { relations } from "drizzle-orm/relations";
import { usersInHf, userAddressesInHf, addressesInHf, emailDomains, merchantsInHf, merchantAddressesInHf, merchantContactInfoInHf, districts, provinces, productsInHf, productMediaInHf, followsInHf, productCategoriesInHf, discountsInHf, merchantPostsInHf, administrativeUnits, ordersInHf, administrativeRegions, wards, rolesInHf, merchantPaymentMethodsInHf, userRolesInHf, orderProductsInHf } from "./schema";

export const userAddressesInHfRelations = relations(userAddressesInHf, ({one, many}) => ({
	usersInHf: one(usersInHf, {
		fields: [userAddressesInHf.userId],
		references: [usersInHf.id]
	}),
	addressesInHf: one(addressesInHf, {
		fields: [userAddressesInHf.addressId],
		references: [addressesInHf.id]
	}),
	ordersInHfs: many(ordersInHf),
}));

export const usersInHfRelations = relations(usersInHf, ({one, many}) => ({
	userAddressesInHfs: many(userAddressesInHf),
	emailDomain: one(emailDomains, {
		fields: [usersInHf.emailDomainId],
		references: [emailDomains.id]
	}),
	merchantsInHf: one(merchantsInHf, {
		fields: [usersInHf.id],
		references: [merchantsInHf.ownerId]
	}),
	followsInHfs: many(followsInHf),
	ordersInHfs: many(ordersInHf),
	userRolesInHfs: many(userRolesInHf),
}));

export const addressesInHfRelations = relations(addressesInHf, ({one, many}) => ({
	userAddressesInHfs: many(userAddressesInHf),
	merchantAddressesInHfs: many(merchantAddressesInHf),
	district: one(districts, {
		fields: [addressesInHf.districtId],
		references: [districts.code]
	}),
	province: one(provinces, {
		fields: [addressesInHf.provinceId],
		references: [provinces.code]
	}),
}));

export const emailDomainsRelations = relations(emailDomains, ({many}) => ({
	usersInHfs: many(usersInHf),
}));

export const merchantsInHfRelations = relations(merchantsInHf, ({one, many}) => ({
	usersInHfs: many(usersInHf),
	merchantContactInfoInHf: one(merchantContactInfoInHf, {
		fields: [merchantsInHf.id],
		references: [merchantContactInfoInHf.merchantId]
	}),
	merchantAddressesInHf: one(merchantAddressesInHf, {
		fields: [merchantsInHf.id],
		references: [merchantAddressesInHf.merchantId]
	}),
	followsInHfs: many(followsInHf),
	productsInHfs: many(productsInHf),
	merchantPostsInHfs: many(merchantPostsInHf),
	productCategoriesInHfs: many(productCategoriesInHf),
	ordersInHfs: many(ordersInHf),
	rolesInHfs: many(rolesInHf),
	merchantPaymentMethodsInHfs: many(merchantPaymentMethodsInHf),
}));

export const merchantAddressesInHfRelations = relations(merchantAddressesInHf, ({one, many}) => ({
	addressesInHf: one(addressesInHf, {
		fields: [merchantAddressesInHf.addressId],
		references: [addressesInHf.id]
	}),
	merchantsInHfs: many(merchantsInHf),
}));

export const merchantContactInfoInHfRelations = relations(merchantContactInfoInHf, ({many}) => ({
	merchantsInHfs: many(merchantsInHf),
}));

export const districtsRelations = relations(districts, ({one, many}) => ({
	addressesInHfs: many(addressesInHf),
	administrativeUnit: one(administrativeUnits, {
		fields: [districts.administrativeUnitId],
		references: [administrativeUnits.id]
	}),
	province: one(provinces, {
		fields: [districts.provinceCode],
		references: [provinces.code]
	}),
	wards: many(wards),
}));

export const provincesRelations = relations(provinces, ({one, many}) => ({
	addressesInHfs: many(addressesInHf),
	districts: many(districts),
	administrativeRegion: one(administrativeRegions, {
		fields: [provinces.administrativeRegionId],
		references: [administrativeRegions.id]
	}),
	administrativeUnit: one(administrativeUnits, {
		fields: [provinces.administrativeUnitId],
		references: [administrativeUnits.id]
	}),
}));

export const productMediaInHfRelations = relations(productMediaInHf, ({one}) => ({
	productsInHf: one(productsInHf, {
		fields: [productMediaInHf.productId],
		references: [productsInHf.id]
	}),
}));

export const productsInHfRelations = relations(productsInHf, ({one, many}) => ({
	productMediaInHfs: many(productMediaInHf),
	merchantsInHf: one(merchantsInHf, {
		fields: [productsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	productCategoriesInHf: one(productCategoriesInHf, {
		fields: [productsInHf.categoryId],
		references: [productCategoriesInHf.id]
	}),
	discountsInHf: one(discountsInHf, {
		fields: [productsInHf.discountId],
		references: [discountsInHf.id]
	}),
	orderProductsInHfs: many(orderProductsInHf),
}));

export const followsInHfRelations = relations(followsInHf, ({one}) => ({
	usersInHf: one(usersInHf, {
		fields: [followsInHf.followingUserId],
		references: [usersInHf.id]
	}),
	merchantsInHf: one(merchantsInHf, {
		fields: [followsInHf.followedMerchantId],
		references: [merchantsInHf.id]
	}),
}));

export const productCategoriesInHfRelations = relations(productCategoriesInHf, ({one, many}) => ({
	productsInHfs: many(productsInHf),
	merchantsInHf: one(merchantsInHf, {
		fields: [productCategoriesInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	productCategoriesInHf: one(productCategoriesInHf, {
		fields: [productCategoriesInHf.parentId],
		references: [productCategoriesInHf.id],
		relationName: "productCategoriesInHf_parentId_productCategoriesInHf_id"
	}),
	productCategoriesInHfs: many(productCategoriesInHf, {
		relationName: "productCategoriesInHf_parentId_productCategoriesInHf_id"
	}),
}));

export const discountsInHfRelations = relations(discountsInHf, ({many}) => ({
	productsInHfs: many(productsInHf),
}));

export const merchantPostsInHfRelations = relations(merchantPostsInHf, ({one}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [merchantPostsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
}));

export const administrativeUnitsRelations = relations(administrativeUnits, ({many}) => ({
	districts: many(districts),
	provinces: many(provinces),
	wards: many(wards),
}));

export const ordersInHfRelations = relations(ordersInHf, ({one, many}) => ({
	usersInHf: one(usersInHf, {
		fields: [ordersInHf.userId],
		references: [usersInHf.id]
	}),
	merchantsInHf: one(merchantsInHf, {
		fields: [ordersInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	userAddressesInHf: one(userAddressesInHf, {
		fields: [ordersInHf.shippingAddressId],
		references: [userAddressesInHf.id]
	}),
	orderProductsInHfs: many(orderProductsInHf),
}));

export const administrativeRegionsRelations = relations(administrativeRegions, ({many}) => ({
	provinces: many(provinces),
}));

export const wardsRelations = relations(wards, ({one}) => ({
	administrativeUnit: one(administrativeUnits, {
		fields: [wards.administrativeUnitId],
		references: [administrativeUnits.id]
	}),
	district: one(districts, {
		fields: [wards.districtCode],
		references: [districts.code]
	}),
}));

export const rolesInHfRelations = relations(rolesInHf, ({one, many}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [rolesInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	userRolesInHfs: many(userRolesInHf),
}));

export const merchantPaymentMethodsInHfRelations = relations(merchantPaymentMethodsInHf, ({one}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [merchantPaymentMethodsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
}));

export const userRolesInHfRelations = relations(userRolesInHf, ({one}) => ({
	usersInHf: one(usersInHf, {
		fields: [userRolesInHf.userId],
		references: [usersInHf.id]
	}),
	rolesInHf: one(rolesInHf, {
		fields: [userRolesInHf.roleId],
		references: [rolesInHf.id]
	}),
}));

export const orderProductsInHfRelations = relations(orderProductsInHf, ({one}) => ({
	ordersInHf: one(ordersInHf, {
		fields: [orderProductsInHf.orderId],
		references: [ordersInHf.id]
	}),
	productsInHf: one(productsInHf, {
		fields: [orderProductsInHf.productId],
		references: [productsInHf.id]
	}),
}));