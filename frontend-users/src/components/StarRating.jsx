import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxRating = 5, size = 'md', showNumber = true, onChange = null, interactive = false }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8'
    };

    const sizeClass = sizes[size] || sizes.md;

    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[...Array(maxRating)].map((_, index) => {
                    const ratingValue = index + 1;
                    const isFilled = ratingValue <= Math.round(rating);
                    const isPartial = !isFilled && ratingValue - 0.5 <= rating;

                    return (
                        <div
                            key={index}
                            className={`relative ${interactive ? 'cursor-pointer' : ''}`}
                            onClick={() => handleClick(ratingValue)}
                        >
                            {isPartial ? (
                                <div className="relative">
                                    <Star className={`${sizeClass} text-gray-300 fill-gray-300`} />
                                    <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                                        <Star className={`${sizeClass} text-amber-400 fill-amber-400`} />
                                    </div>
                                </div>
                            ) : (
                                <Star
                                    className={`${sizeClass} ${isFilled
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300 fill-gray-300'
                                        } ${interactive ? 'hover:text-amber-300 hover:fill-amber-300' : ''}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showNumber && (
                <span className="text-sm font-semibold text-gray-900">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
