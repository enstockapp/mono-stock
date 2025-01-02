import { CreatePermissionDto, PermissionEnum } from 'src/roles'

export const InitPermissionsDB: CreatePermissionDto[] = [
	{
		id: PermissionEnum.DASHBOARD_SEE_DASHBOARD_SECTION, // 100001
		name: PermissionEnum[PermissionEnum.DASHBOARD_SEE_DASHBOARD_SECTION], // 'DASHBOARD_SEE_DASHBOARD_SECTION'
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_INVENTARY_CURRENT_VALUE,
		name: PermissionEnum[PermissionEnum.INVENTARY_SEE_INVENTARY_CURRENT_VALUE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_ADD_NEW_PRODUCT,
		name: PermissionEnum[PermissionEnum.INVENTARY_ADD_NEW_PRODUCT],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_EDIT_PRODUCT,
		name: PermissionEnum[PermissionEnum.INVENTARY_EDIT_PRODUCT],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_INVENTARY_AJUSTMENT_SECTION,
		name: PermissionEnum[
			PermissionEnum.INVENTARY_SEE_INVENTARY_AJUSTMENT_SECTION
		],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_PURCHASES_TABLE,
		name: PermissionEnum[PermissionEnum.INVENTARY_SEE_PURCHASES_TABLE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_SALES_TABLE,
		name: PermissionEnum[PermissionEnum.INVENTARY_SEE_SALES_TABLE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_ADD_PURCHASE,
		name: PermissionEnum[PermissionEnum.INVENTARY_ADD_PURCHASE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_EDIT_PURCHASE,
		name: PermissionEnum[PermissionEnum.INVENTARY_EDIT_PURCHASE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_ADD_SALE,
		name: PermissionEnum[PermissionEnum.INVENTARY_ADD_SALE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_EDIT_SALE,
		name: PermissionEnum[PermissionEnum.INVENTARY_EDIT_SALE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_CATEGORIES_TABLE,
		name: PermissionEnum[PermissionEnum.INVENTARY_SEE_CATEGORIES_TABLE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_ADD_CATEGORY,
		name: PermissionEnum[PermissionEnum.INVENTARY_ADD_CATEGORY],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_EDIT_CATEGORY,
		name: PermissionEnum[PermissionEnum.INVENTARY_EDIT_CATEGORY],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_SEE_VARIANTS_TABLE,
		name: PermissionEnum[PermissionEnum.INVENTARY_SEE_VARIANTS_TABLE],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_ADD_VARIANT,
		name: PermissionEnum[PermissionEnum.INVENTARY_ADD_VARIANT],
		description: '',
	},
	{
		id: PermissionEnum.INVENTARY_EDIT_VARIANT,
		name: PermissionEnum[PermissionEnum.INVENTARY_EDIT_VARIANT],
		description: '',
	},
	{
		id: PermissionEnum.CUSTOMERS_SEE_CUSTOMERS,
		name: PermissionEnum[PermissionEnum.CUSTOMERS_SEE_CUSTOMERS],
		description: '',
	},
	{
		id: PermissionEnum.CUSTOMERS_ADD_CUSTOMER,
		name: PermissionEnum[PermissionEnum.CUSTOMERS_ADD_CUSTOMER],
		description: '',
	},
	{
		id: PermissionEnum.CUSTOMER_EDIT_CUSTOMER,
		name: PermissionEnum[PermissionEnum.CUSTOMER_EDIT_CUSTOMER],
		description: '',
	},
	{
		id: PermissionEnum.SUPPLIERS_SEE_SUPPLIERS,
		name: PermissionEnum[PermissionEnum.SUPPLIERS_SEE_SUPPLIERS],
		description: '',
	},
	{
		id: PermissionEnum.SUPPLIERS_ADD_SUPPLIER,
		name: PermissionEnum[PermissionEnum.SUPPLIERS_ADD_SUPPLIER],
		description: '',
	},
	{
		id: PermissionEnum.SUPPLIERS_EDIT_SUPPLIER,
		name: PermissionEnum[PermissionEnum.SUPPLIERS_EDIT_SUPPLIER],
		description: '',
	},
	{
		id: PermissionEnum.SETTINGS_SEE_SETTINGS_SECTION,
		name: PermissionEnum[PermissionEnum.SETTINGS_SEE_SETTINGS_SECTION],
		description: '',
	},
]
