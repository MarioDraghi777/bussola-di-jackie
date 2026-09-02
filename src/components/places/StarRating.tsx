export function StarRating(props: { value?: number; onChange: (value: number) => void }) {
  return (
    <div class="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          class="star-btn"
          aria-label={`${n} stelle`}
          onClick={() => props.onChange(n)}
        >
          {(props.value ?? 0) >= n ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
