import { useEffect, useRef } from 'preact/hooks';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLE_URL } from '../../services/mapConfig';

export interface MapMarkerSpec {
  id: string;
  lng: number;
  lat: number;
  color: string;
  emoji: string;
  onClick?: () => void;
}

export interface MapLibreMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarkerSpec[];
  onMapReady?: (map: maplibregl.Map) => void;
  onMoveEnd?: (center: { lng: number; lat: number }) => void;
  onClick?: (lngLat: { lng: number; lat: number }) => void;
  class?: string;
}

function makeMarkerEl(color: string, emoji: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'map-pin';
  el.style.background = color;
  el.textContent = emoji;
  return el;
}

export function MapLibreMap(props: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Il mount/unmount della mappa avviene una sola volta: center/zoom iniziali,
  // gli aggiornamenti successivi si fanno via handler, non ricreando la mappa.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: props.center,
      zoom: props.zoom ?? 13,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    props.onMapReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.onMoveEnd) return;
    const handler = () => props.onMoveEnd!(map.getCenter());
    map.on('moveend', handler);
    return () => {
      map.off('moveend', handler);
    };
  }, [props.onMoveEnd]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.onClick) return;
    const handler = (e: maplibregl.MapMouseEvent) => props.onClick!(e.lngLat);
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [props.onClick]);

  // Ricostruisce i marker ogni volta che cambia la lista: il dataset è piccolo
  // (centinaia di voci), non serve un diffing più sofisticato.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of markersRef.current) marker.remove();
    markersRef.current = [];

    for (const spec of props.markers ?? []) {
      const el = makeMarkerEl(spec.color, spec.emoji);
      if (spec.onClick) el.addEventListener('click', (e) => {
        e.stopPropagation();
        spec.onClick!();
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat([spec.lng, spec.lat]).addTo(map);
      markersRef.current.push(marker);
    }
  }, [props.markers]);

  return <div ref={containerRef} class={`map-container ${props.class ?? ''}`} />;
}
