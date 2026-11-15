import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatMoney, type BookDetail, type BookPage } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { useCart } from '../lib/store';

interface Props {
  book: BookDetail;
  onClose: () => void;
}

interface Leaf {
  front: PageFace;
  back: PageFace;
}

interface PageFace {
  title: string;
  body: string;
  pageNumber?: number;
  cover?: boolean;
  backCover?: boolean;
}

/**
 * Build the physical leaves of the book: leaf 0 carries the front cover and
 * page 1; each following leaf holds a right-hand page (even) and a left-hand
 * page (odd); the final leaf closes on the back cover.
 */
function buildLeaves(book: BookDetail): Leaf[] {
  const pages: BookPage[] = book.pages;
  const leaves: Leaf[] = [
    {
      front: { title: book.title, body: '', cover: true },
      back: pageFace(pages[0], 1),
    },
  ];

  for (let k = 1; 2 * k - 1 < pages.length; k += 1) {
    const isLast = 2 * k + 1 >= pages.length;
    leaves.push({
      front: pageFace(pages[2 * k - 1], 2 * k),
      back: isLast ? { title: book.title, body: '', backCover: true } : pageFace(pages[2 * k], 2 * k + 1),
    });
  }
  return leaves;
}

function pageFace(page: BookPage | undefined, pageNumber: number): PageFace {
  return {
    title: page?.title ?? '—',
    body: page?.body ?? '',
    pageNumber,
  };
}

/** The 3D page-turn reader from the template, driven by real page content. */
export function BookReader({ book, onClose }: Props) {
  const { t, level } = useI18n();
  const add = useCart((s) => s.add);
  const [n, setN] = useState(0);
  const dragStart = useRef<number | null>(null);
  const didDrag = useRef(false);
  const bookRef = useRef<HTMLDivElement>(null);

  const leaves = useMemo(() => buildLeaves(book), [book]);
  const total = leaves.length;

  const go = useCallback(
    (delta: number) => setN((cur) => Math.max(0, Math.min(total, cur + delta))),
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) > 40) {
      go(delta < 0 ? 1 : -1);
      didDrag.current = true;
      window.setTimeout(() => (didDrag.current = false), 50);
    }
  };

  const handleBookClick = (e: React.MouseEvent) => {
    if (didDrag.current) return;
    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return;
    go(e.clientX > rect.left + rect.width / 2 ? 1 : -1);
  };

  const renderFace = (face: Leaf['front'], side: 'front' | 'back') => {
    const classes = ['pg'];
    if (side === 'back') classes.push('b');
    if (face.cover) classes.push('cover');
    if (face.backCover) classes.push('cover', 'bc');
    return (
      <div
        className={classes.join(' ')}
        style={{ ['--c' as string]: book.color }}
        key={side}
      >
        {face.cover && <small>{level(book.level)}</small>}
        {!face.backCover && <h3>{face.title}</h3>}
        {!face.cover && !face.backCover && <span>{face.body}</span>}
        {!face.cover && !face.backCover && <div className="n">{face.pageNumber}</div>}
      </div>
    );
  };

  return (
    <div className="ov on" id="vw" role="dialog" aria-modal="true" aria-label={book.title}>
      <div className="bw">
        <div
          className={`book${n > 0 && n < total ? ' open' : ''}${n === total ? ' end' : ''}`}
          id="book"
          ref={bookRef}
          onClick={handleBookClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {leaves.map((leaf, k) => (
            <div
              className={`lf${k < n ? ' fl' : ''}`}
              data-k={k}
              key={k}
              style={{ zIndex: k < n ? k : total - k }}
            >
              {renderFace(leaf.front, 'front')}
              {renderFace(leaf.back, 'back')}
            </div>
          ))}
        </div>
      </div>

      <div className="bar" id="bar" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="ghost" onClick={() => go(-1)} aria-label={t('back')}>
          ‹
        </button>
        <b>
          {book.title} · {formatMoney(book.finalPriceMillimes)}
        </b>
        <button className="ghost" onClick={() => go(1)} aria-label={t('next')}>
          ›
        </button>
        <button className="btn" onClick={() => add(book)}>
          {t('add')}
        </button>
        <button className="ghost" onClick={onClose}>
          {t('cl')}
        </button>
      </div>
    </div>
  );
}
