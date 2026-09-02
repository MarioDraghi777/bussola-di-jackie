import { signal } from '@preact/signals';

export type PageName = 'lista' | 'mappa' | 'vicino' | 'aggiungi' | 'import' | 'impostazioni' | 'posto';

export interface Route {
  page: PageName;
  param?: string;
}

const VALID_PAGES: PageName[] = ['lista', 'mappa', 'vicino', 'aggiungi', 'import', 'impostazioni', 'posto'];

function parseHash(): Route {
  const raw = location.hash.replace(/^#\/?/, '');
  const [page, param] = raw.split('/');
  const validPage = VALID_PAGES.includes(page as PageName) ? (page as PageName) : 'lista';
  return { page: validPage, param: param ? decodeURIComponent(param) : undefined };
}

/** Rotta corrente, derivata dall'hash dell'URL: dà "indietro" nativo del telefono senza librerie. */
export const route = signal<Route>(parseHash());

window.addEventListener('hashchange', () => {
  route.value = parseHash();
});

export function navigate(page: PageName, param?: string): void {
  location.hash = param ? `/${page}/${encodeURIComponent(param)}` : `/${page}`;
}
