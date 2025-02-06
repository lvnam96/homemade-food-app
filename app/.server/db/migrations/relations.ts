import { relations } from "drizzle-orm/relations";
import { usersInHf, authSessionsInHf, merchantsInHf, addressesInHf, districts, provinces, merchantContactInfoInHf, merchantPostsInHf, merchantPaymentMethodsInHf, productsInHf, discountsInHf, followsInHf, ordersInHf, shippingAddressesInHf, orderItemsInHf, productMediaInHf, productCategoriesInHf, administrativeUnits, wards, userCredentialsInHf, administrativeRegions, productsToCategoriesInHf, userAddressesInHf, userRolesInHf, rolesInHf } from "./schema";

export const authSessionsInHfRelations = relations(authSessionsInHf, ({one}) => ({
	usersInHf: one(usersInHf, {
		fields: [authSessionsInHf.userId],
		references: [usersInHf.id]
	}),
}));

export const usersInHfRelations = relations(usersInHf, ({many}) => ({
	authSessionsInHfs: many(authSessionsInHf),
	merchantsInHfs: many(merchantsInHf),
	followsInHfs: many(followsInHf),
	ordersInHfs: many(ordersInHf),
	userCredentialsInHfs: many(userCredentialsInHf),
	userAddressesInHfs: many(userAddressesInHf),
	userRolesInHfs_userId: many(userRolesInHf, {
		relationName: "userRolesInHf_userId_usersInHf_id"
	}),
	userRolesInHfs_assignedBy: many(userRolesInHf, {
		relationName: "userRolesInHf_assignedBy_usersInHf_id"
	}),
}));

export const merchantsInHfRelations = relations(merchantsInHf, ({one, many}) => ({
	usersInHf: one(usersInHf, {
		fields: [merchantsInHf.ownerId],
		references: [usersInHf.id]
	}),
	addressesInHf: one(addressesInHf, {
		fields: [merchantsInHf.addressId],
		references: [addressesInHf.id]
	}),
	merchantContactInfoInHfs: many(merchantContactInfoInHf),
	merchantPostsInHfs: many(merchantPostsInHf),
	merchantPaymentMethodsInHfs: many(merchantPaymentMethodsInHf),
	productsInHfs: many(productsInHf),
	followsInHfs: many(followsInHf),
	ordersInHfs: many(ordersInHf),
	productCategoriesInHfs: many(productCategoriesInHf),
}));

export const addressesInHfRelations = relations(addressesInHf, ({one, many}) => ({
	merchantsInHfs: many(merchantsInHf),
	district: one(districts, {
		fields: [addressesInHf.districtId],
		references: [districts.code]
	}),
	province: one(provinces, {
		fields: [addressesInHf.provinceId],
		references: [provinces.code]
	}),
	userAddressesInHfs: many(userAddressesInHf),
}));

export const districtsRelations = relations(districts, ({one, many}) => ({
	addressesInHfs: many(addressesInHf),
	wards: many(wards),
	administrativeUnit: one(administrativeUnits, {
		fields: [districts.administrativeUnitId],
		references: [administrativeUnits.id]
	}),
	province: one(provinces, {
		fields: [districts.provinceCode],
		references: [provinces.code]
	}),
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

export const merchantContactInfoInHfRelations = relations(merchantContactInfoInHf, ({one}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [merchantContactInfoInHf.merchantId],
		references: [merchantsInHf.id]
	}),
}));

export const merchantPostsInHfRelations = relations(merchantPostsInHf, ({one}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [merchantPostsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
}));

export const merchantPaymentMethodsInHfRelations = relations(merchantPaymentMethodsInHf, ({one}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [merchantPaymentMethodsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
}));

export const productsInHfRelations = relations(productsInHf, ({one, many}) => ({
	merchantsInHf: one(merchantsInHf, {
		fields: [productsInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	discountsInHf: one(discountsInHf, {
		fields: [productsInHf.discountId],
		references: [discountsInHf.id]
	}),
	orderItemsInHfs: many(orderItemsInHf),
	productMediaInHfs: many(productMediaInHf),
	productsToCategoriesInHfs: many(productsToCategoriesInHf),
}));

export const discountsInHfRelations = relations(discountsInHf, ({many}) => ({
	productsInHfs: many(productsInHf),
	ordersInHfs: many(ordersInHf),
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

export const ordersInHfRelations = relations(ordersInHf, ({one, many}) => ({
	discountsInHf: one(discountsInHf, {
		fields: [ordersInHf.discountId],
		references: [discountsInHf.id]
	}),
	usersInHf: one(usersInHf, {
		fields: [ordersInHf.userId],
		references: [usersInHf.id]
	}),
	merchantsInHf: one(merchantsInHf, {
		fields: [ordersInHf.merchantId],
		references: [merchantsInHf.id]
	}),
	shippingAddressesInHf: one(shippingAddressesInHf, {
		fields: [ordersInHf.shippingAddressId],
		references: [shippingAddressesInHf.id]
	}),
	orderItemsInHfs: many(orderItemsInHf),
}));

export const shippingAddressesInHfRelations = relations(shippingAddressesInHf, ({many}) => ({
	ordersInHfs: many(ordersInHf),
}));

export const orderItemsInHfRelations = relations(orderItemsInHf, ({one}) => ({
	ordersInHf: one(ordersInHf, {
		fields: [orderItemsInHf.orderId],
		references: [ordersInHf.id]
	}),
	productsInHf: one(productsInHf, {
		fields: [orderItemsInHf.productId],
		references: [productsInHf.id]
	}),
}));

export const productMediaInHfRelations = relations(productMediaInHf, ({one}) => ({
	productsInHf: one(productsInHf, {
		fields: [productMediaInHf.productId],
		references: [productsInHf.id]
	}),
}));

export const productCategoriesInHfRelations = relations(productCategoriesInHf, ({one, many}) => ({
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
	productsToCategoriesInHfs: many(productsToCategoriesInHf),
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

export const administrativeUnitsRelations = relations(administrativeUnits, ({many}) => ({
	wards: many(wards),
	districts: many(districts),
	provinces: many(provinces),
}));

export const userCredentialsInHfRelations = relations(userCredentialsInHf, ({one}) => ({
	usersInHf: one(usersInHf, {
		fields: [userCredentialsInHf.userId],
		references: [usersInHf.id]
	}),
}));

export const administrativeRegionsRelations = relations(administrativeRegions, ({many}) => ({
	provinces: many(provinces),
}));

export const productsToCategoriesInHfRelations = relations(productsToCategoriesInHf, ({one}) => ({
	productsInHf: one(productsInHf, {
		fields: [productsToCategoriesInHf.productId],
		references: [productsInHf.id]
	}),
	productCategoriesInHf: one(productCategoriesInHf, {
		fields: [productsToCategoriesInHf.categoryId],
		references: [productCategoriesInHf.id]
	}),
}));

export const userAddressesInHfRelations = relations(userAddressesInHf, ({one}) => ({
	usersInHf: one(usersInHf, {
		fields: [userAddressesInHf.userId],
		references: [usersInHf.id]
	}),
	addressesInHf: one(addressesInHf, {
		fields: [userAddressesInHf.addressId],
		references: [addressesInHf.id]
	}),
}));

export const userRolesInHfRelations = relations(userRolesInHf, ({one}) => ({
	usersInHf_userId: one(usersInHf, {
		fields: [userRolesInHf.userId],
		references: [usersInHf.id],
		relationName: "userRolesInHf_userId_usersInHf_id"
	}),
	usersInHf_assignedBy: one(usersInHf, {
		fields: [userRolesInHf.assignedBy],
		references: [usersInHf.id],
		relationName: "userRolesInHf_assignedBy_usersInHf_id"
	}),
	rolesInHf: one(rolesInHf, {
		fields: [userRolesInHf.roleId],
		references: [rolesInHf.id]
	}),
}));

export const rolesInHfRelations = relations(rolesInHf, ({many}) => ({
	userRolesInHfs: many(userRolesInHf),
}));