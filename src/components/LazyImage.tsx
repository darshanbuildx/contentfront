import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  fallback = 'https://via.placeholder.com/400x400?text=Loading...', 
  className = '',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative ${isLoading ? 'animate-pulse' : ''}`}>
      <img
        src={error ? fallback : imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        } ${className}`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};