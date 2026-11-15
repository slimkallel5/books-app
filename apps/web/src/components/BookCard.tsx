import { formatMoney, type Book } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { useCart } from '../lib/store';
import { flyElement, replayClass } from '../lib/animations';

interface Props {
  book: Book;
  /** Optional badge, e.g. an offer tag or a ranking number. */
  tag?: { label: string; gold?: boolean };
  showOldPrice?: boolean;
  onOpen?: (book: Book) => void;
  cartButtonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * A catalogue/featured card. Clicking the mini cover opens the reader; the
 * "add" button animates a small book flying to the cart button.
 */
export function BookCard({ book, tag, showOldPrice, onOpen, cartButtonRef }: Props) {
  const { t, level } = useI18n();
  const add = useCart((s) => s.add);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    add(book);
    const cartRect = cartButtonRef?.current?.getBoundingClientRect();
    if (cartRect) {
      flyElement(e.currentTarget.getBoundingClientRect(), cartRect, { color: book.color });
    }
    replayClass(cartButtonRef?.current ?? null, 'bump');
  };

  return (
    <div className="card">
      <div
        className="mini"
        data-open={book.id}
        style={{ ['--c' as string]: book.color }}
        role="button"
        tabIndex={0}
        aria-label={`${t('open')} ${book.title}`}
        onClick={() => onOpen?.(book)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen?.(book);
          }
        }}
      >
        {book.title}
      </div>

      {tag && (
        <span className="tag" style={tag.gold ? { background: 'var(--gold)' } : undefined}>
          {tag.label}
        </span>
      )}

      <small>{level(book.level)}</small>
      <b>{book.title}</b>
      <span className="price">
        {formatMoney(book.finalPriceMillimes)}
        {showOldPrice && book.discountPct > 0 && (
          <s style={{ color: 'var(--mut)', fontWeight: 400, marginInlineStart: 6 }}>
            {formatMoney(book.priceMillimes)}
          </s>
        )}
      </span>

      <button className="btn" onClick={handleAdd}>
        {t('add')}
      </button>
    </div>
  );
}
