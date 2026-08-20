import { useQuery } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { Store } from '@/lib/types';

const STORAGE_KEY = 'shelfiq.storeId';
const DEFAULT_STORE = 'STORE01';

interface ActiveStoreValue {
  storeId: string;
  setStoreId: (id: string) => void;
  stores: Store[];
  activeStore: Store | undefined;
  isLoading: boolean;
}

const ActiveStoreContext = createContext<ActiveStoreValue | null>(null);

export function ActiveStoreProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_STORE;
    } catch {
      return DEFAULT_STORE;
    }
  });

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: api.stores,
    staleTime: 60 * 60 * 1000, // store list is static config
  });

  // If the persisted id isn't in the server's list, fall back to the first one.
  useEffect(() => {
    if (stores.length > 0 && !stores.some((s) => s.store_id === storeId)) {
      setStoreIdState(stores[0].store_id);
    }
  }, [stores, storeId]);

  const setStoreId = useCallback((id: string) => {
    setStoreIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<ActiveStoreValue>(
    () => ({
      storeId,
      setStoreId,
      stores,
      activeStore: stores.find((s) => s.store_id === storeId),
      isLoading,
    }),
    [storeId, setStoreId, stores, isLoading],
  );

  return <ActiveStoreContext.Provider value={value}>{children}</ActiveStoreContext.Provider>;
}

export function useActiveStore(): ActiveStoreValue {
  const ctx = useContext(ActiveStoreContext);
  if (!ctx) throw new Error('useActiveStore must be used inside <ActiveStoreProvider>');
  return ctx;
}
