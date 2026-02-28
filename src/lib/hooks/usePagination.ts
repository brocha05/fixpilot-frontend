'use client';

import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (field: string) => void;
  toggleSortOrder: () => void;
  reset: () => void;
}

const DEFAULT_STATE: PaginationState = {
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function usePagination(
  initialState?: Partial<PaginationState>
): PaginationState & PaginationActions {
  const [state, setState] = useState<PaginationState>({
    ...DEFAULT_STATE,
    ...initialState,
  });

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);

  const setLimit = useCallback((limit: number) => setState((s) => ({ ...s, limit, page: 1 })), []);

  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, search, page: 1 })),
    []
  );

  const setSortBy = useCallback(
    (sortBy: string) => setState((s) => ({ ...s, sortBy, page: 1 })),
    []
  );

  const toggleSortOrder = useCallback(
    () => setState((s) => ({ ...s, sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' })),
    []
  );
  const reset = useCallback(() => setState({ ...DEFAULT_STATE, ...initialState }), [initialState]);

  return { ...state, setPage, setLimit, setSearch, setSortBy, toggleSortOrder, reset };
}
