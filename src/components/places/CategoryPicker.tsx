import { categories as categoriesSignal } from '../../stores/categoriesStore';

export function CategoryPicker(props: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div class="chip-picker">
      {categoriesSignal.value.map((c) => {
        const isSelected = props.selected.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            class={`chip-picker-item ${isSelected ? 'selected' : ''}`}
            style={{ '--chip-color': `var(--fam-${c.colorFamily})` }}
            onClick={() => props.onToggle(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        );
      })}
    </div>
  );
}
