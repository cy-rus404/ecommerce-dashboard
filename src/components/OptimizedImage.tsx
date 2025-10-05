"use client";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({ src, alt, className, width, height }: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getOptimizedUrl = (url: string, w?: number, h?: number) => {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
    
    // If it's already a Supabase URL, add transformation parameters
    if (url.includes('supabase')) {
      const params = new URLSearchParams();
      if (w) params.append('width', w.toString());
      if (h) params.append('height', h.toString());
      params.append('quality', '80');
      params.append('format', 'webp');
      
      return `${url}?${params.toString()}`;
    }
    
    return url;
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={error ? "https://via.placeholder.com/300x200?text=No+Image" : getOptimizedUrl(src, width, height)}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
}