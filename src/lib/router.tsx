import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type RouterContextValue = {
  path: string;
  query: URLSearchParams;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function currentQuery(): URLSearchParams {
  const hash = window.location.hash.replace(/^#/, '');
  const idx = hash.indexOf('?');
  return idx >= 0 ? new URLSearchParams(hash.slice(idx + 1)) : new URLSearchParams();
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath());
  const [query, setQuery] = useState(currentQuery());

  useEffect(() => {
    const onHashChange = () => {
      setPath(currentPath());
      setQuery(currentQuery());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to.startsWith('#')) to = to.slice(1);
    if (window.location.hash === '#' + to) {
      setPath(to.split('?')[0]);
      setQuery(new URLSearchParams(to.split('?')[1] || ''));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      window.location.hash = to;
    }
  }, []);

  return (
    <RouterContext.Provider value={{ path: path.split('?')[0], query, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function useParams<Params extends { [K in keyof Params]?: string } = Record<string, string>>(): Params {
  const { path } = useRouter();
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};
  if (parts[0] === 'product' && parts[1]) {
    params.slug = decodeURIComponent(parts[1]);
  }
  if (parts[0] === 'admin' && parts[1]) {
    params.section = decodeURIComponent(parts[1]);
  }
  return params as Params;
}
