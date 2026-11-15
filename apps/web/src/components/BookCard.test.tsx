import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Book } from '@maktaba/shared';
import { BookCard } from './BookCard';
import { useCart } from '../lib/store';

const book: Book = {
  id: 11,
  slug: 'maths-6',
  title: 'Maths 6',
  level: 'g6',
  color: '#b84a62',
  priceMillimes: 18000,
  discountPct: 15,
  finalPriceMillimes: 15300,
  spineW: 36,
  spineH: 168,
  coverUrl: null,
  description: 'A mathematics book.',
  isFeatured: true,
  stock: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('BookCard', () => {
  beforeEach(() => {
    useCart.setState({ lines: [] });
  });

  it('renders the title, level label and discounted price', () => {
    render(<BookCard book={book} showOldPrice />);
    // The title appears on both the mini cover and the caption.
    expect(screen.getAllByText('Maths 6')).toHaveLength(2);
    expect(screen.getByText('Primary grade 6')).toBeInTheDocument();
    expect(screen.getByText(/15\.3 DT/)).toBeInTheDocument();
    // The struck-through original price is shown for offers.
    expect(screen.getByText(/18\.0 DT/)).toBeInTheDocument();
  });

  it('adds the book to the cart when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookCard book={book} />);
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    const lines = useCart.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]!.bookId).toBe(11);
    expect(lines[0]!.unitPriceMillimes).toBe(15300);
  });

  it('opens the reader when the cover is activated', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<BookCard book={book} onOpen={onOpen} />);
    await user.click(screen.getByRole('button', { name: /open maths 6/i }));
    expect(onOpen).toHaveBeenCalledWith(book);
  });
});
