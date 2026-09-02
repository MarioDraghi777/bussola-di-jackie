import type { DuplicateMatch } from '../../services/duplicates';

export function DuplicateWarning(props: { matches: DuplicateMatch[] }) {
  if (props.matches.length === 0) return null;
  return (
    <div class="duplicate-warning">
      <strong>⚠️ Forse esiste già:</strong>
      <ul>
        {props.matches.slice(0, 3).map((m) => (
          <li key={m.place.id}>
            {m.place.name} <span class="duplicate-reason">({m.reason})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
