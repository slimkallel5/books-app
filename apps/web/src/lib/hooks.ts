import { useQuery } from '@tanstack/react-query';
import type { BookListQuery } from '@maktaba/shared';
import { api } from '../lib/api';

export function useBooks(params: Partial<BookListQuery>) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => api.listBooks(params),
    placeholderData: (prev) => prev,
  });
}

export function useFeatured() {
  return useQuery({ queryKey: ['featured'], queryFn: api.featured });
}

export function useBook(idOrSlug: string | number | undefined) {
  return useQuery({
    queryKey: ['book', idOrSlug],
    queryFn: () => api.getBook(idOrSlug!),
    enabled: idOrSlug !== undefined,
  });
}

export function useCategories(locale: string) {
  return useQuery({ queryKey: ['categories', locale], queryFn: () => api.categories(locale) });
}
