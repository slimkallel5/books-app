import pg from 'pg';
import { Router } from 'express';
import { createOrderSchema, formatMoney, type CreateOrderInput } from '@maktaba/shared';
import { query, withTransaction } from '../../db/pool.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as booksRepo from '../books/books.repo.js';

export const ordersRouter = Router();

function generateOrderNo(): string {
  const rand = Math.floor(Math.random() * 90000 + 10000);
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `MK-${stamp}${rand}`;
}

/** POST /orders — place an order. Prices are always recalculated server-side. */
ordersRouter.post('/', validate(createOrderSchema), async (req, res, next) => {
  try {
    const input = req.body as CreateOrderInput;
    const books = await booksRepo.listBooksByIds(input.items.map((i) => i.bookId));
    const byId = new Map(books.map((b) => [b.id, b]));

    const lines = input.items.map((item) => {
      const book = byId.get(item.bookId);
      if (!book) throw badRequest(`Unknown book id ${item.bookId}`);
      const unit = book.finalPriceMillimes;
      return {
        book,
        qty: item.qty,
        unit,
        lineTotal: unit * item.qty,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

    let discountPct = 0;
    if (input.couponCode) {
      const coupon = await query<{ pct: number }>(
        `SELECT pct FROM coupons
          WHERE code = $1 AND active = true AND (expires_at IS NULL OR expires_at > now())`,
        [input.couponCode.toUpperCase()],
      );
      if (!coupon.rows[0]) throw badRequest('Invalid or expired coupon code');
      discountPct = coupon.rows[0].pct;
    }

    const discount = Math.round((subtotal * discountPct) / 100);
    const total = subtotal - discount;
    const orderNo = generateOrderNo();

    const orderId = await withTransaction(async (client) => {
      const orderRes = await client.query<{ id: number }>(
        `INSERT INTO orders
           (order_no, name, phone, city, address, locale,
            subtotal_millimes, discount_millimes, total_millimes, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
         RETURNING id`,
        [
          orderNo,
          input.name,
          input.phone,
          input.city,
          input.address,
          input.locale,
          subtotal,
          discount,
          total,
        ],
      );
      const id = orderRes.rows[0]!.id;
      for (const line of lines) {
        await client.query(
          `INSERT INTO order_items
             (order_id, book_id, title_snapshot, color_snapshot, qty,
              unit_price_millimes, line_total_millimes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            id,
            line.book.id,
            line.book.title,
            line.book.color,
            line.qty,
            line.unit,
            line.lineTotal,
          ],
        );
      }
      return id;
    });

    res.status(201).json({
      id: orderId,
      orderNo,
      name: input.name,
      phone: input.phone,
      city: input.city,
      address: input.address,
      subtotalMillimes: subtotal,
      discountMillimes: discount,
      totalMillimes: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: lines.map((l) => ({
        bookId: l.book.id,
        title: l.book.title,
        color: l.book.color,
        qty: l.qty,
        unitPriceMillimes: l.unit,
        lineTotalMillimes: l.lineTotal,
      })),
      totalDisplay: formatMoney(total),
    });
  } catch (err) {
    next(err);
  }
});

/** Admin: list recent orders. */
ordersRouter.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await query<OrderRow>(
      `SELECT o.*, coalesce(json_agg(json_build_object(
          'bookId', oi.book_id, 'title', oi.title_snapshot, 'color', oi.color_snapshot,
          'qty', oi.qty, 'unitPriceMillimes', oi.unit_price_millimes,
          'lineTotalMillimes', oi.line_total_millimes
        ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 100`,
    );
    res.json({ items: orders.rows.map(mapOrderRow) });
  } catch (err) {
    next(err);
  }
});

/** Admin: fetch a single order by its public order number. */
ordersRouter.get('/:orderNo', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const rows = await query<OrderRow>(
      `SELECT o.*, coalesce(json_agg(json_build_object(
          'bookId', oi.book_id, 'title', oi.title_snapshot, 'color', oi.color_snapshot,
          'qty', oi.qty, 'unitPriceMillimes', oi.unit_price_millimes,
          'lineTotalMillimes', oi.line_total_millimes
        ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.order_no = $1
        GROUP BY o.id`,
      [req.params.orderNo],
    );
    if (!rows.rows[0]) throw notFound('Order not found');
    res.json(mapOrderRow(rows.rows[0]));
  } catch (err) {
    next(err);
  }
});

interface OrderRow extends pg.QueryResultRow {
  id: number;
  order_no: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  subtotal_millimes: number;
  discount_millimes: number;
  total_millimes: number;
  status: string;
  created_at: Date;
  items: unknown[];
}

function mapOrderRow(row: OrderRow) {
  return {
    id: row.id,
    orderNo: row.order_no,
    name: row.name,
    phone: row.phone,
    city: row.city,
    address: row.address,
    subtotalMillimes: row.subtotal_millimes,
    discountMillimes: row.discount_millimes,
    totalMillimes: row.total_millimes,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    items: row.items,
  };
}
