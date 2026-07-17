import { Star } from 'lucide-react';

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={
            n <= Math.round(rating)
              ? 'fill-sand-500 text-sand-500'
              : 'fill-ink-100 text-ink-200'
          }
        />
      ))}
    </div>
  );
}
