import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ rating = 0, interactive = false, onRate, size = 16 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = displayRating >= starIndex;
        const isHalf = !isFilled && displayRating >= starIndex - 0.5;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            className={interactive ? 'star-interactive' : ''}
            onClick={() => interactive && onRate && onRate(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
              color: isFilled || isHalf ? 'var(--accent-amber)' : 'var(--border-medium)'
            }}
            aria-label={`Rate ${starIndex} stars`}
          >
            <Star 
              size={size} 
              fill={isFilled ? 'currentColor' : 'none'} 
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
      {rating > 0 && !interactive && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '4px' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
