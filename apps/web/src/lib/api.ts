import type {
  Book,
  BookDetail,
  BookListQuery,
  Category,
  CreateOrderInput,
  Order,
} from '@maktaba/shared';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let code = 'HTTP_ERROR';
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      code = body?.error?.code ?? code;
      message = body?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function toQueryString(query: Partial<BookListQuery>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const api = {
  listBooks: (query: Partial<BookListQuery> = {}) =>
    request<Paginated<Book>>(`/books${toQueryString(query)}`),
  getBook: (idOrSlug: string | number) => request<BookDetail>(`/books/${idOrSlug}`),
  featured: () => request<{ items: Book[] }>('/featured'),
  categories: (locale: string) => request<Category[]>(`/categories?locale=${locale}`),
  createOrder: (input: CreateOrderInput) =>
    request<Order & { totalDisplay: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string; name: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  listOrders: (token: string) =>
    request<{ items: Order[] }>('/orders', { headers: { authorization: `Bearer ${token}` } }),
  createBook: (token: string, body: unknown) =>
    request<Book>('/books', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  updateBook: (token: string, id: number, body: unknown) =>
    request<Book>(`/books/${id}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  deleteBook: (token: string, id: number) =>
    request<void>(`/books/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    }),
};
