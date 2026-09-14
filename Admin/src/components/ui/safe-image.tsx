"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIconClassName?: string;
  fallbackContainerClassName?: string;
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  fallbackIconClassName = "h-8 w-8 text-muted-foreground opacity-30",
  fallbackContainerClassName = "w-full h-full flex items-center justify-center bg-muted absolute inset-0",
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={cn(fallbackContainerClassName, className)}>
        <ImageIcon className={fallbackIconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
