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

export function parseLocationGeo(rawLocation?: string): { cleanLocation: string; lat?: number; lng?: number } {
  if (!rawLocation) return { cleanLocation: '' };
  const geoMatch = rawLocation.match(/\[GEO:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    const cleanLocation = rawLocation.replace(/\[GEO:\s*-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?\]/gi, '').trim();
    return { cleanLocation, lat: isNaN(lat) ? undefined : lat, lng: isNaN(lng) ? undefined : lng };
  }
  return { cleanLocation: rawLocation.trim() };
}
