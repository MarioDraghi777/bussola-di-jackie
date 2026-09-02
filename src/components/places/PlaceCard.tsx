import type { Place } from '../../types';
import { categories as categoriesSignal } from '../../stores/categoriesStore';
import { STATUS_LABELS } from '../../constants';
import { formatDistance } from '../../services/distance';
import { navigate } from '../../router';
import { CategoryChip } from './CategoryChip';
import { NavigateButton } from './NavigateButton';

export function PlaceCard(props: { place: Place; distanceMeters?: number }) {
  const { place, distanceMeters } = props;
  const cats = categoriesSignal.value.filter((c) => place.categories.includes(c.id));

  return (
    <div class="place-card" onClick={() => navigate('posto', place.id)}>
      <div class="place-card-top">
        <div>
          <p class="place-card-name">{place.name}</p>
          <div class="place-card-meta">
            {place.city}
            {place.cuisine ? ` · ${place.cuisine}` : ''}
            {distanceMeters != null ? ` · ${formatDistance(distanceMeters)}` : ''}
          </div>
        </div>
        <span class={`status-badge status-${place.status}`}>{STATUS_LABELS[place.status]}</span>
      </div>
      <div class="place-card-chips">
        {cats.map((c) => (
          <CategoryChip key={c.id} category={c} size="sm" />
        ))}
        {place.tags.map((t) => (
          <span key={t} class="chip-tag">
            #{t}
          </span>
        ))}
      </div>
      <NavigateButton lat={place.lat} lng={place.lng} class="btn-sm" />
    </div>
  );
}
