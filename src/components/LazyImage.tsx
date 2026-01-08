import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  className?: string;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  placeholder,
  fallback,
  className,
  onError,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={cn('object-cover', className)}
        {...props}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} ref={imgRef}>
      {!isLoaded && (
        <div className="absolute inset-0">
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover blur-sm scale-110"
              aria-hidden="true"
            />
          ) : (
            <Skeleton variant="rectangular" className="w-full h-full" />
          )}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};
