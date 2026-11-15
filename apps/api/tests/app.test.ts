import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

async function adminToken(): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@maktaba.local', password: 'admin12345' });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/v1/books', () => {
  it('returns a paginated envelope', async () => {
    const res = await request(app).get('/api/v1/books?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.total).toBeGreaterThanOrEqual(12);
    expect(res.body.page).toBe(1);
  });

  it('filters by level', async () => {
    const res = await request(app).get('/api/v1/books?level=g1');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.every((b: { level: string }) => b.level === 'g1')).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/v1/books?sort=price_asc&limit=60');
    const prices = res.body.items.map((b: { finalPriceMillimes: number }) => b.finalPriceMillimes);
    expect([...prices].sort((a: number, b: number) => a - b)).toEqual(prices);
  });

  it('searches by title', async () => {
    const res = await request(app).get('/api/v1/books?q=Maths');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.every((b: { title: string }) => /maths/i.test(b.title))).toBe(true);
  });

  it('rejects an invalid query', async () => {
    const res = await request(app).get('/api/v1/books?limit=999');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/books/:idOrSlug', () => {
  it('returns a book with reader pages', async () => {
    const res = await request(app).get('/api/v1/books/maths-1');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('maths-1');
    expect(Array.isArray(res.body.pages)).toBe(true);
    expect(res.body.pages.length).toBeGreaterThan(0);
  });

  it('404s for an unknown book', async () => {
    const res = await request(app).get('/api/v1/books/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/v1/categories', () => {
  it('localises labels', async () => {
    const res = await request(app).get('/api/v1/categories?locale=fr');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0].slug).toBe('g1');
    expect(res.body[0].label).not.toBe('g1');
  });
});

describe('GET /api/v1/i18n/:locale', () => {
  it('returns rtl for Arabic', async () => {
    const res = await request(app).get('/api/v1/i18n/ar');
    expect(res.status).toBe(200);
    expect(res.body.dir).toBe('rtl');
  });

  it('404s for an unsupported locale', async () => {
    const res = await request(app).get('/api/v1/i18n/de');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/featured', () => {
  it('returns featured books', async () => {
    const res = await request(app).get('/api/v1/featured');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('POST /api/v1/orders', () => {
  let bookA: { id: number; finalPriceMillimes: number };
  let bookB: { id: number; finalPriceMillimes: number };

  beforeAll(async () => {
    const res = await request(app).get('/api/v1/books?limit=2');
    [bookA, bookB] = res.body.items;
  });

  const validBody = () => ({
    name: 'Amine Ben Salah',
    phone: '+216 20 123 456',
    city: 'Tunis',
    address: '12 Avenue Habib Bourguiba',
    locale: 'en',
    items: [
      { bookId: bookA.id, qty: 1 },
      { bookId: bookB.id, qty: 2 },
    ],
  });

  it('creates an order and recalculates totals server-side', async () => {
    const res = await request(app).post('/api/v1/orders').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body.orderNo).toMatch(/^MK-/);
    expect(res.body.status).toBe('pending');
    const expected = bookA.finalPriceMillimes * 1 + bookB.finalPriceMillimes * 2;
    expect(res.body.totalMillimes).toBe(expected);
    expect(res.body.discountMillimes).toBe(0);
    expect(res.body.items).toHaveLength(2);
  });

  it('applies a valid coupon', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ ...validBody(), couponCode: 'MAKTABA15' });
    expect(res.status).toBe(201);
    const subtotal = res.body.subtotalMillimes;
    expect(res.body.discountMillimes).toBe(Math.round((subtotal * 15) / 100));
    expect(res.body.totalMillimes).toBe(subtotal - res.body.discountMillimes);
  });

  it('rejects an unknown coupon', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ ...validBody(), couponCode: 'NOPE' });
    expect(res.status).toBe(400);
  });

  it('rejects an empty cart', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ ...validBody(), items: [] });
    expect(res.status).toBe(400);
  });

  it('rejects an unknown book id', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ ...validBody(), items: [{ bookId: 999999, qty: 1 }] });
    expect(res.status).toBe(400);
  });
});

describe('admin orders', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  it('lists orders for an authenticated admin', async () => {
    const token = await adminToken();
    const created = await request(app).get('/api/v1/books?limit=1');
    const bookId = created.body.items[0].id;

    const order = await request(app)
      .post('/api/v1/orders')
      .send({
        name: 'Sara Trabelsi',
        phone: '+216 21 000 000',
        city: 'Sousse',
        address: '5 Rue de la Plage',
        items: [{ bookId, qty: 1 }],
      });
    expect(order.status).toBe(201);

    const list = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.items.some((o: { orderNo: string }) => o.orderNo === order.body.orderNo)).toBe(
      true,
    );

    const single = await request(app)
      .get(`/api/v1/orders/${order.body.orderNo}`)
      .set('Authorization', `Bearer ${token}`);
    expect(single.status).toBe(200);
    expect(single.body.orderNo).toBe(order.body.orderNo);
  });
});

describe('auth', () => {
  it('rejects bad credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@maktaba.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns the current admin from /auth/me', async () => {
    const token = await adminToken();
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });
});
