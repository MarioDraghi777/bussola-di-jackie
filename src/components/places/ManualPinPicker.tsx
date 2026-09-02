import { useEffect, useRef, useState } from 'preact/hooks';
import { LazyMap } from '../map/LazyMap';
import { Sheet } from '../layout/Sheet';
import { reverseGeocode } from '../../services/geocoding';
import { ROME_CENTER } from '../../services/mapConfig';

export function ManualPinPicker(props: {
  initialCenter?: [number, number];
  onConfirm: (coords: { lat: number; lng: number }, label?: string) => void;
  onClose: () => void;
}) {
  const [center, setCenter] = useState<{ lng: number; lat: number }>(() => {
    const [lng, lat] = props.initialCenter ?? ROME_CENTER;
    return { lng, lat };
  });
  const [label, setLabel] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    setLabel(undefined);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(center.lat, center.lng).then(setLabel);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [center.lat, center.lng]);

  return (
    <Sheet title="Posiziona il pin" onClose={props.onClose}>
      <p class="hint-text">Muovi la mappa finché il segnaposto non è sul punto giusto, poi conferma.</p>
      <div class="manual-pin-map-wrap">
        <LazyMap center={props.initialCenter ?? ROME_CENTER} zoom={15} onMoveEnd={setCenter} />
        <div class="center-pin-overlay" aria-hidden="true">
          📍
        </div>
      </div>
      <p class="pin-label">{label ?? `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`}</p>
      <button class="btn btn-primary btn-block" onClick={() => props.onConfirm(center, label)}>
        Conferma questa posizione
      </button>
    </Sheet>
  );
}
