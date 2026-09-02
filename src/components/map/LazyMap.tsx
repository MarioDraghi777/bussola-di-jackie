import { useEffect, useState } from 'preact/hooks';
import type { ComponentType } from 'preact';
import type { MapLibreMapProps } from './MapLibreMap';

/**
 * MapLibre GL pesa qualche centinaio di KB: la maggior parte delle sessioni
 * (consultare la lista, aggiungere un posto trovato al primo colpo) non apre
 * mai una mappa. Caricarla solo quando serve tiene il primo avvio veloce
 * anche su rete mobile lenta.
 */
export function LazyMap(props: MapLibreMapProps) {
  const [Component, setComponent] = useState<ComponentType<MapLibreMapProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('./MapLibreMap').then((mod) => {
      if (!cancelled) setComponent(() => mod.MapLibreMap);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Component) {
    return <div class={`map-container map-loading ${props.class ?? ''}`}>Carico la mappa…</div>;
  }
  return <Component {...props} />;
}
