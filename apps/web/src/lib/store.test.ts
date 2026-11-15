import { beforeEach, describe, expect, it } from 'vitest';
import { cartCount, cartSubtotal, useCart } from './store';

const book = (id: number, price: number) =>
  ({
    id,
    slug: `book-${id}`,
    title: `Book ${id}`,
    level: 'g1' as const,
    color: '#c2542d',
    priceMillimes: price,
    discountPct: 0,
    finalPriceMillimes: price,
    spineW: 30,
    spineH: 130,
    coverUrl: null,
    description: '',
    isFeatured: false,
    stock: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });

describe('cart store', () => {
  beforeEach(() => {
    useCart.setState({ lines: [] });
  });

  it('adds a new line and merges quantities for repeats', () => {
    useCart.getState().add(book(1, 10000));
    useCart.getState().add(book(1, 10000), 2);
    expect(useCart.getState().lines).toHaveLength(1);
    expect(useCart.getState().lines[0]!.qty).toBe(3);
  });

  it('increments, decrements and removes lines', () => {
    useCart.getState().add(book(1, 10000));
    useCart.getState().increment(1);
    expect(useCart.getState().lines[0]!.qty).toBe(2);
    useCart.getState().decrement(1);
    expect(useCart.getState().lines[0]!.qty).toBe(1);
    useCart.getState().decrement(1);
    expect(useCart.getState().lines).toHaveLength(0);
    useCart.getState().add(book(2, 5000));
    useCart.getState().remove(2);
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it('computes count and subtotal from unit prices', () => {
    useCart.getState().add(book(1, 10000), 2);
    useCart.getState().add(book(2, 5000));
    const lines = useCart.getState().lines;
    expect(cartCount(lines)).toBe(3);
    expect(cartSubtotal(lines)).toBe(25000);
  });
});
