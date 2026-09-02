import { buildNavigationUrl } from '../../services/mapsNav';

/**
 * Va reso come <a> vero e proprio (non un onClick che apre window.open dopo un
 * await): iOS considera "universal link" solo un tap diretto su un link,
 * altrimenti l'link si apre sempre nel browser invece che nell'app Google Maps.
 */
export function NavigateButton(props: { lat: number; lng: number; class?: string }) {
  return (
    <a
      href={buildNavigationUrl(props.lat, props.lng)}
      target="_blank"
      rel="noopener"
      class={`btn btn-primary ${props.class ?? ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      🧭 Naviga
    </a>
  );
}
