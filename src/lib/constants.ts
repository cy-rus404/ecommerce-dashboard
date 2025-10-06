// Application constants for better maintainability
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  SHOES: 'shoes',
  ACCESSORIES: 'accessories',
  BEAUTY: 'beauty',
  SPORTS: 'sports',
  BOOKS: 'books',
  HOME: 'home',
  TOYS: 'toys',
  JEWELRY: 'jewelry',
  OTHER: 'other'
} as const;

export const VALIDATION_LIMITS = {
  PRODUCT_NAME_MAX: 100,
  DESCRIPTION_MAX: 1000,
  BRAND_MAX: 50,
  EMAIL_MAX: 100,
  PHONE_MAX: 15,
  ADDRESS_MAX: 200,
  CITY_MAX: 50,
  PRICE_MAX: 999999,
  STOCK_MAX: 999999
} as const;

export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_ls40okk',
  TEMPLATE_ID: 'template_9enxem8',
  PUBLIC_KEY: 'FEIXpFEr5PuvhR_6g'
} as const;

export const QUERY_LIMITS = {
  ORDERS_LIMIT: 100,
  PRODUCTS_LIMIT: 50
} as const;