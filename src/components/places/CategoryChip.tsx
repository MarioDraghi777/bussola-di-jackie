import type { Category } from '../../types';

export function CategoryChip(props: { category: Category; size?: 'sm' | 'md' }) {
  const { category, size = 'md' } = props;
  return (
    <span class={`chip chip-${size}`} style={{ '--chip-color': `var(--fam-${category.colorFamily})` }}>
      <span aria-hidden="true">{category.emoji}</span> {category.label}
    </span>
  );
}
