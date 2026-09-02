/**
 * Link universale di Google Maps per la navigazione. Su iOS e Android, se l'app
 * di Google Maps è installata, il sistema operativo intercetta questo URL come
 * "universal link"/"app link" e la apre nativamente; altrimenti si apre nel browser.
 * Niente schemi custom (comgooglemaps://, intent://): sono fragili e richiedono
 * rilevare la piattaforma; questo unico URL funziona ovunque per costruzione.
 */
export function buildNavigationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
