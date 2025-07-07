'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallback?: React.ReactNode;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  fallback,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return <>{fallback}</>;
  }

  const imageProps = {
    src,
    alt: alt || '',
    className,
    onError: () => setHasError(true),
    ...(fill ? { fill: true, sizes } : { width, height }),
  };

  return (
    <div className={fill ? "relative w-full h-full" : ""}>
      <Image {...imageProps} alt={alt || ''} />
    </div>
  );
}
