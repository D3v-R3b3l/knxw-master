import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  blurDataURL = null,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setLoaded(false);
  };

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {(!loaded || !inView) && (
        <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="w-8 h-8 bg-[#333] rounded" />
          )}
        </div>
      )}
      
      {/* Blur placeholder if provided */}
      {blurDataURL && !loaded && inView && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50"
        />
      )}

      {/* Main image */}
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            error && 'hidden'
          )}
          {...props}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center text-[#a3a3a3] text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  sizes = "100vw",
  className = '',
  priority = false,
  ...props 
}) => {
  // Generate responsive image URLs if needed
  const getSrcSet = (baseSrc) => {
    const sizes = [640, 768, 1024, 1280, 1920];
    return sizes.map(size => {
      // This would typically use an image CDN or service
      return `${baseSrc}?w=${size} ${size}w`;
    }).join(', ');
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      srcSet={getSrcSet(src)}
      sizes={sizes}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
};