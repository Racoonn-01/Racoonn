import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isActiveProperty(property: { status?: string }) {
  // If no status is explicitly set, default to showing it to maintain backwards compatibility
  if (!property.status) return true;
  const status = property.status.toLowerCase();
  return status === 'active' || status === 'published';
}
