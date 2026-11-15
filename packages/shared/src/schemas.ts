import { z } from 'zod';
import { LEVELS, LOCALES, ORDER_STATUSES, SORTS } from './constants';

export const localeSchema = z.enum(LOCALES);
export const levelSchema = z.enum(LEVELS);
export const sortSchema = z.enum(SORTS);
export const orderStatusSchema = z.enum(ORDER_STATUSES);

/** Non-negative integer millimes. */
const millimes = z.number().int().nonnegative();

export const bookSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  title: z.string().min(1),
  level: levelSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  priceMillimes: millimes,
  discountPct: z.number().int().min(0).max(90),
  finalPriceMillimes: millimes,
  spineW: z.number().int().min(8).max(120),
  spineH: z.number().int().min(40).max(320),
  coverUrl: z.string().nullable(),
  description: z.string(),
  isFeatured: z.boolean(),
  stock: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Book = z.infer<typeof bookSchema>;

export const bookPageSchema = z.object({
  id: z.number().int().positive(),
  bookId: z.number().int().positive(),
  spreadIndex: z.number().int().min(0),
  pageIndex: z.number().int().min(0),
  title: z.string(),
  body: z.string(),
});
export type BookPage = z.infer<typeof bookPageSchema>;

export const bookDetailSchema = bookSchema.extend({
  pages: z.array(bookPageSchema),
});
export type BookDetail = z.infer<typeof bookDetailSchema>;

export const categorySchema = z.object({
  slug: levelSchema,
  label: z.string(),
  sortOrder: z.number().int(),
});
export type Category = z.infer<typeof categorySchema>;

export const bookListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  level: z.union([levelSchema, z.literal('all')]).default('all'),
  sort: sortSchema.default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
  featured: z.coerce.boolean().optional(),
});
export type BookListQuery = z.infer<typeof bookListQuerySchema>;

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });

export const orderItemInputSchema = z.object({
  bookId: z.number().int().positive(),
  qty: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30),
  city: z.string().trim().min(2).max(120),
  address: z.string().trim().min(4).max(300),
  locale: localeSchema.default('en'),
  couponCode: z.string().trim().max(40).optional(),
  items: z.array(orderItemInputSchema).min(1),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderItemSchema = z.object({
  bookId: z.number().int().positive(),
  title: z.string(),
  color: z.string(),
  qty: z.number().int().positive(),
  unitPriceMillimes: millimes,
  lineTotalMillimes: millimes,
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.number().int().positive(),
  orderNo: z.string(),
  name: z.string(),
  phone: z.string(),
  city: z.string(),
  address: z.string(),
  subtotalMillimes: millimes,
  discountMillimes: millimes,
  totalMillimes: millimes,
  status: orderStatusSchema,
  createdAt: z.string(),
  items: z.array(orderItemSchema),
});
export type Order = z.infer<typeof orderSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const adminUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin']),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const bookUpsertSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(200),
  level: levelSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  priceMillimes: millimes,
  discountPct: z.number().int().min(0).max(90).default(0),
  spineW: z.number().int().min(8).max(120),
  spineH: z.number().int().min(40).max(320),
  coverUrl: z.string().url().nullable().optional(),
  description: z.string().max(2000).default(''),
  isFeatured: z.boolean().default(false),
  stock: z.number().int().min(0).default(100),
});
export type BookUpsertInput = z.infer<typeof bookUpsertSchema>;
