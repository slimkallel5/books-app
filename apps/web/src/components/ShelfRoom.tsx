import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatMoney, type Book } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { flyElement, prefersReducedMotion } from '../lib/animations';

const SPINE_PALETTE = ['#d9c7a3', '#b9c9b5', '#c9b0a0', '#a9b8c9', '#d4b483', '#9fb0a0', '#c7a9b3'];

/** Deterministic decorative spines, identical to the template's `fill()`. */
function decorativeSpines(seed: number, count: number) {
  return Array.from({ length: count }, (_, j) => {
    const a = Math.abs(Math.sin(seed * 12.9 + j * 7.7));
    return {
      w: 14 + Math.floor(a * 12),
      h: 85 + Math.floor(a * 65),
      color: SPINE_PALETTE[(seed + j) % SPINE_PALETTE.length]!,
    };
  });
}

interface Props {
  books: Book[];
  onSelectLevel: (level: Book['level']) => void;
  catalogueRef: React.RefObject<HTMLElement>;
}

/**
 * The 3D shelf from the template: the room tilts with the pointer, spines flip
 * out on hover and a tooltip follows the cursor. Clicking a spine animates the
 * book flying into the catalogue and filters the list to that level.
 */
export function ShelfRoom({ books, onSelectLevel, catalogueRef }: Props) {
  const { t, level } = useI18n();
  const roomRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [hovered, setHovered] = useState<Book | null>(null);

  const shelves = useMemo(() => {
    const topRow = decorativeSpines(1, 9);
    const plant = decorativeSpines(5, 7);
    const rows = [
      [0, 1, 2],
      [3, 4, 5],
    ].map((group, r) => ({
      r,
      decorativeBefore: decorativeSpines(r * 3, 4),
      group,
      decorativeAfter: group.map((k, j) => ({ k, spines: decorativeSpines(r * 3 + j + 9, 3) })),
    }));
    return { topRow, plant, rows };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const room = roomRef.current;
      const tip = tipRef.current;
      const hero = room?.closest('.hero') as HTMLElement | null;
      if (!hero || !room || !tip) return;

      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      hero.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      room.style.setProperty('--ry', `${x * -14}deg`);
      room.style.setProperty('--rx', `${y * 8}deg`);
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHovered(null);
    roomRef.current?.style.setProperty('--ry', '0deg');
    roomRef.current?.style.setProperty('--rx', '0deg');
  }, []);

  useEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    if (!hovered) {
      tip.style.opacity = '0';
      return;
    }
    tip.innerHTML = `<b>${hovered.title}</b><span>${level(hovered.level)}</span><br/><em>${formatMoney(
      hovered.finalPriceMillimes,
    )}</em> · <span>${t('tip')}</span>`;
    tip.style.opacity = '1';
  }, [hovered, level, t]);

  // Keep the tooltip near the cursor without re-rendering React on every move.
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const tip = tipRef.current;
      if (!tip || tip.style.opacity !== '1') return;
      tip.style.left = `${Math.min(e.clientX + 16, window.innerWidth - 240)}px`;
      tip.style.top = `${e.clientY + 16}px`;
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  const handleSpineClick = (e: React.MouseEvent<HTMLElement>, book: Book) => {
    onSelectLevel(book.level);
    const catalogue = catalogueRef.current;
    if (!catalogue) return;

    if (prefersReducedMotion()) {
      catalogue.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const from = e.currentTarget.getBoundingClientRect();
    catalogue.scrollIntoView({ behavior: 'smooth' });

    // Wait a frame so the grid renders before measuring the target card.
    requestAnimationFrame(() => {
      const target = catalogue.querySelector<HTMLElement>('.mini');
      if (!target) return;
      const to = target.getBoundingClientRect();
      const card = target.parentElement;
      if (card) card.style.visibility = 'hidden';
      flyElement(from, to, {
        color: book.color,
        width: from.width,
        height: from.height,
        scaleTo: to,
      });
      window.setTimeout(() => {
        if (card) {
          card.style.visibility = '';
          card.classList.add('pop');
        }
      }, 1100);
    });
  };

  const Spine = ({ book }: { book: Book }) => (
    <div
      className="bk"
      tabIndex={0}
      role="button"
      data-id={book.id}
      aria-label={`${book.title} — ${level(book.level)}`}
      style={{ ['--w' as string]: book.spineW, ['--h' as string]: book.spineH, ['--c' as string]: book.color }}
      onPointerEnter={() => setHovered(book)}
      onClick={(e) => handleSpineClick(e, book)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSpineClick(e as unknown as React.MouseEvent<HTMLElement>, book);
      }}
    >
      <i className="sp">{level(book.level)}</i>
      <i className="cv" />
    </div>
  );

  return (
    <div className="scene">
      <div
        className="room"
        id="room"
        ref={roomRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="row">
          <span className="dec">🕰️</span>
          {shelves.topRow.map((s, i) => (
            <div key={`t${i}`} className="dk" style={{ ['--w' as string]: s.w, ['--h' as string]: s.h, ['--c' as string]: s.color }} />
          ))}
          <span className="dec">🪴</span>
          {shelves.plant.map((s, i) => (
            <div key={`p${i}`} className="dk" style={{ ['--w' as string]: s.w, ['--h' as string]: s.h, ['--c' as string]: s.color }} />
          ))}
        </div>

        {shelves.rows.map(({ r, decorativeBefore, group, decorativeAfter }) => (
          <div className="row" key={r}>
            {decorativeBefore.map((s, i) => (
              <div key={`d${r}-${i}`} className="dk" style={{ ['--w' as string]: s.w, ['--h' as string]: s.h, ['--c' as string]: s.color }} />
            ))}
            {group.map((k, j) => {
              const book = books[k * 2];
              return (
                <span key={`g${k}`} style={{ display: 'contents' }}>
                  {book && <Spine book={book} />}
                  {decorativeAfter[j]!.spines.map((s, i) => (
                    <div key={`a${r}-${j}-${i}`} className="dk" style={{ ['--w' as string]: s.w, ['--h' as string]: s.h, ['--c' as string]: s.color }} />
                  ))}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div id="tip" ref={tipRef} role="tooltip" aria-hidden="true" />
    </div>
  );
}
