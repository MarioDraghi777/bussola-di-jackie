/**
 * L'app gira in due contesti diversi: dentro il browser, oppure come app
 * installata (icona sulla schermata Home). Su iOS in particolare i due
 * contesti hanno archivi dati SEPARATI: stesso indirizzo, stesso sito, ma
 * quello che salvi in Safari non lo vedi dall'icona sulla Home e viceversa.
 * Non è qualcosa che l'app possa unire da sola: si può solo dirlo chiaramente
 * all'utente e dargli export/import per spostare i dati da un lato all'altro.
 */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Chiede al browser di considerare i dati "persistenti", così non vengono
 * buttati via quando lo spazio scarseggia. Supportato su Chrome/Firefox;
 * Safari lo ignora, quindi è best-effort e non blocca nulla.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Spazio occupato dai dati dell'app, in forma leggibile ("340 KB", "1,2 MB"). */
export async function storageUsageLabel(): Promise<string | null> {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage } = await navigator.storage.estimate();
    if (usage == null) return null;
    if (usage < 1024 * 1024) return `${Math.max(1, Math.round(usage / 1024))} KB`;
    return `${(usage / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  } catch {
    return null;
  }
}
