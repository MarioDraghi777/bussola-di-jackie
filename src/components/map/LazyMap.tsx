import { useEffect, useState } from 'preact/hooks';
import type { ComponentType } from 'preact';
import type { MapLibreMapProps } from './MapLibreMap';
import { reloadOnceForStaleAssets } from '../../utils/appUpdate';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; Component: ComponentType<MapLibreMapProps> }
  | { status: 'error' };

/**
 * MapLibre GL pesa qualche centinaio di KB: la maggior parte delle sessioni
 * (consultare la lista, aggiungere un posto trovato al primo colpo) non apre
 * mai una mappa. Caricarla solo quando serve tiene il primo avvio veloce
 * anche su rete mobile lenta.
 */
export function LazyMap(props: MapLibreMapProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    import('./MapLibreMap')
      .then((mod) => {
        if (!cancelled) setState({ status: 'ready', Component: mod.MapLibreMap });
      })
      .catch(() => {
        if (cancelled) return;
        // Causa tipica: è uscita una versione nuova dell'app e questo pezzo non
        // esiste più con il vecchio nome. Un ricaricamento risolve; se non si
        // può ricaricare (o è appena successo), si mostra un errore riprovabile
        // invece di lasciare la schermata appesa per sempre.
        if (reloadOnceForStaleAssets()) return;
        setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.status === 'error') {
    return (
      <div class={`map-container map-loading ${props.class ?? ''}`}>
        <div class="map-error">
          <p>Non riesco a caricare la mappa.</p>
          <button class="btn btn-secondary btn-sm" onClick={() => setAttempt((n) => n + 1)}>
            Riprova
          </button>
          <button class="btn btn-secondary btn-sm" onClick={() => location.reload()}>
            Ricarica l'app
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'loading') {
    return <div class={`map-container map-loading ${props.class ?? ''}`}>Carico la mappa…</div>;
  }

  const Component = state.Component;
  return <Component {...props} />;
}
