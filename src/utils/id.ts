/** Generatore di id univoci, disponibile nativamente in tutti i browser moderni. */
export function newId(): string {
  return crypto.randomUUID();
}
