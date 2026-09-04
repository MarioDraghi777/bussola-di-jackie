import { signal } from '@preact/signals';

/**
 * Testo arrivato dalla condivisione di sistema (Web Share Target): su Android,
 * con la PWA installata, "Condividi" dentro Google Maps può mandare qui nome,
 * indirizzo e link del posto. Viene consumato dalla schermata Aggiungi.
 */
export const pendingShare = signal<string | null>(null);

/** Legge i parametri di condivisione dall'URL di avvio e ripulisce la barra degli indirizzi. */
export function captureShareFromUrl(): void {
  const params = new URLSearchParams(location.search);
  const parts = [params.get('title'), params.get('text'), params.get('url')].filter(
    (value): value is string => Boolean(value && value.trim()),
  );
  if (parts.length === 0) return;

  // il testo condiviso spesso contiene già il link: si evita di ripeterlo
  const unique = parts.filter((part, index) => parts.findIndex((p) => p.includes(part)) === index);
  pendingShare.value = unique.join('\n');

  const clean = `${location.pathname}${location.hash || ''}`;
  history.replaceState(null, '', clean);
}

export function consumePendingShare(): string | null {
  const value = pendingShare.value;
  pendingShare.value = null;
  return value;
}
