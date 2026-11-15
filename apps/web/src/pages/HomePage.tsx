import { useMemo, useRef, useState } from 'react';
import { SORTS, type Book, type Level, type Sort } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { useBooks, useFeatured } from '../lib/hooks';
import { BookCard } from '../components/BookCard';
import { ShelfRoom } from '../components/ShelfRoom';
import { BookReader } from '../components/BookReader';
import { api } from '../lib/api';
import { useQuery } from '@tanstack/react-query';

export function HomePage({ cartButtonRef }: { cartButtonRef: React.RefObject<HTMLButtonElement> }) {
  const { t, level } = useI18n();

  const [q, setQ] = useState('');
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [readerId, setReaderId] = useState<number | null>(null);

  const catalogueRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: featured } = useFeatured();
  const { data: list, isLoading } = useBooks({ q, level: levelFilter, sort, limit: 24 });
  // The shelf always shows the full catalogue, independent of the active filters.
  const { data: allBooks } = useBooks({ limit: 60 });

  const shelfBooks: Book[] = useMemo(() => allBooks?.items ?? [], [allBooks]);

  const { data: readerBook } = useQuery({
    queryKey: ['book', readerId],
    queryFn: () => api.getBook(readerId!),
    enabled: readerId !== null,
  });

  const featuredItems = featured?.items ?? [];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const hero = heroRef.current;
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    hero.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const scrollToCatalogue = () =>
    catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <div className="hero" id="hero" ref={heroRef} onPointerMove={handlePointerMove}>
        <div>
          <h1 id="h1" dangerouslySetInnerHTML={{ __html: t('h1') }} />
          <p id="hp">{t('hp')}</p>
          <button className="btn" id="cta" onClick={scrollToCatalogue}>
            {t('cta')}
          </button>
        </div>

        <ShelfRoom
          books={shelfBooks}
          catalogueRef={catalogueRef}
          onSelectLevel={(lvl) => {
            setLevelFilter(lvl);
            scrollToCatalogue();
          }}
        />
      </div>

      <section className="cat" id="feat">
        <h2 id="fh">{t('bs')}</h2>
        <div className="grid" id="fg">
          {featuredItems.map((book, k) => (
            <BookCard
              key={book.id}
              book={book}
              cartButtonRef={cartButtonRef}
              showOldPrice
              onOpen={(b) => setReaderId(b.id)}
              tag={
                book.discountPct > 0
                  ? { label: `${t('off')} −${book.discountPct}%` }
                  : { label: `#${k + 1}`, gold: true }
              }
            />
          ))}
        </div>
      </section>

      <section className="cat" id="catalogue" ref={catalogueRef}>
        <h2 id="ch">{t('ch')}</h2>
        <div className="tools">
          <label className="sr-only" htmlFor="q">
            {t('q')}
          </label>
          <input
            id="q"
            placeholder={t('q')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <label className="sr-only" htmlFor="lv">
            {t('all')}
          </label>
          <select
            id="lv"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as Level | 'all')}
          >
            <option value="all">{t('all')}</option>
            {(['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as Level[]).map((lvl) => (
              <option key={lvl} value={lvl}>
                {level(lvl)}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="so">
            {t('s1')}
          </label>
          <select id="so" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {s === 'featured' ? t('s1') : s === 'price_asc' ? t('s2') : t('s3')}
              </option>
            ))}
          </select>
        </div>

        <div className="grid" id="grid">
          {isLoading && !list
            ? Array.from({ length: 8 }).map((_, i) => (
                <div className="card" key={i}>
                  <div className="skeleton" style={{ height: 150 }} />
                  <div className="skeleton" style={{ height: 16, width: '60%' }} />
                </div>
              ))
            : list && list.items.length > 0
              ? list.items.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    cartButtonRef={cartButtonRef}
                    onOpen={(b) => setReaderId(b.id)}
                  />
                ))
              : (
                  <div className="empty">{t('none')}</div>
                )}
        </div>
      </section>

      {readerBook && <BookReader book={readerBook} onClose={() => setReaderId(null)} />}
    </>
  );
}
