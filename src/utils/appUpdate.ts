/**
 * Gestione degli aggiornamenti dell'app installata.
 *
 * Quando viene pubblicata una versione nuova, il service worker aggiornato
 * prende il controllo subito e ripulisce i file della versione precedente, che
 * nel frattempo non sono più nemmeno sul server (hanno un hash nel nome). La
 * pagina rimasta aperta continua però a eseguire il codice vecchio: al primo
 * caricamento "pigro" (per noi: la mappa) chiederebbe un file che non esiste
 * più. La cura è ricaricare la pagina, che riparte dalla versione nuova.
 */

const RELOAD_MARKER = 'bussola:last-update-reload';
const MIN_INTERVAL_MS = 15000; // evita cicli di ricaricamento se qualcosa va storto

function reloadGuarded(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_MARKER) ?? 0);
    if (Date.now() - last < MIN_INTERVAL_MS) return false;
    sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  } catch {
    // sessionStorage non disponibile: si ricarica comunque, ma una volta sola
    // per caricamento di pagina non è garantito; meglio non rischiare il ciclo
    return false;
  }
  location.reload();
  return true;
}

/**
 * Da chiamare quando il caricamento di un pezzo dell'app fallisce: quasi sempre
 * significa "è uscita una versione nuova mentre eri dentro".
 * Ritorna true se ha avviato il ricaricamento (quindi non serve mostrare errori).
 */
export function reloadOnceForStaleAssets(): boolean {
  return reloadGuarded();
}

/** Ricarica la pagina quando un service worker aggiornato prende il controllo. */
export function watchForServiceWorkerUpdate(): void {
  if (!('serviceWorker' in navigator)) return;
  // alla primissima installazione il controllo passa al service worker senza che
  // ci sia una versione vecchia in esecuzione: lì ricaricare sarebbe inutile
  const hadController = navigator.serviceWorker.controller != null;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) reloadGuarded();
  });
}
