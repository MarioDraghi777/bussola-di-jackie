import { useState } from 'preact/hooks';
import { Sheet } from '../layout/Sheet';
import { isShortenedMapsLink, parseGoogleMapsLink } from '../../services/geocoding';

export function GmapsLinkSheet(props: {
  onConfirm: (coords: { lat: number; lng: number }) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  function handleSubmit() {
    if (isShortenedMapsLink(value)) {
      setError(
        'Questo è un link abbreviato: aprilo nel browser, aspetta che si espanda nella barra degli indirizzi, poi incolla quello.',
      );
      return;
    }
    const coords = parseGoogleMapsLink(value);
    if (!coords) {
      setError('Non riesco a leggere le coordinate da questo link. Prova a copiarlo di nuovo da Google Maps.');
      return;
    }
    props.onConfirm(coords);
  }

  return (
    <Sheet title="Incolla un link Google Maps" onClose={props.onClose}>
      <textarea
        class="input"
        rows={3}
        placeholder="https://www.google.com/maps/place/..."
        value={value}
        onInput={(e) => {
          setValue((e.target as HTMLTextAreaElement).value);
          setError(undefined);
        }}
      />
      {error && <p class="error-text">{error}</p>}
      <button class="btn btn-primary btn-block" onClick={handleSubmit} disabled={!value.trim()}>
        Usa questo link
      </button>
    </Sheet>
  );
}
