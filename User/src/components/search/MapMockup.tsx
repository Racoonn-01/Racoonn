"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/components/search/PropertyCard';
import Image from 'next/image';
import { Star, X, MapPin, Bed, Bath, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const CITY_COORDINATES: Record<string, [number, number]> = {
  dehradun: [78.0322, 30.3165],
  nainital: [79.4540, 29.3803],
  mussoorie: [78.0754, 30.4598],
  rishikesh: [78.2676, 30.0869],
  haridwar: [78.1642, 29.9457],
  kedarnath: [79.0669, 30.7346],
  auli: [79.5701, 30.5288],
  corbett: [79.1284, 29.3949],
  ramnagar: [79.1284, 29.3949],
  haldwani: [79.5130, 29.2183],
  dewalchaurh: [79.5130, 29.2183],
  dewalchaur: [79.5130, 29.2183],
  kathgodam: [79.5434, 29.2713],
  lalkuan: [79.5173, 29.0722],
  rudrapur: [79.3984, 28.9818],
  pantnagar: [79.4886, 29.0222],
  bhimtal: [79.5606, 29.3496],
  bhowali: [79.5186, 29.3844],
  ramgarh: [79.5552, 29.4285],
  mukteshwar: [79.6473, 29.4722],
  ranikhet: [79.4284, 29.6434],
  almora: [79.6591, 29.5971],
  delhi: [77.2090, 28.6139],
  gurgaon: [77.0266, 28.4595],
  gurugram: [77.0266, 28.4595],
  noida: [77.3910, 28.5355],
  faridabad: [77.3178, 28.4089],
  manali: [77.1887, 32.2432],
  shimla: [77.1734, 31.1048],
  goa: [73.8567, 15.2993],
  udaipur: [73.6821, 24.5854],
  jaipur: [75.7873, 26.9124],
};

const geocodeCache = new Map<string, [number, number]>();

function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371;
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchAddressCoordinates(addressStr: string, proximityCoords?: [number, number]): Promise<[number, number] | null> {
  if (!addressStr || !addressStr.trim()) return null;
  const key = `${addressStr.trim().toLowerCase()}_${proximityCoords ? proximityCoords.join(',') : ''}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  try {
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressStr)}.json?access_token=${MAPBOX_TOKEN}&country=in&limit=1`;
    if (proximityCoords) {
      url += `&proximity=${proximityCoords[0]},${proximityCoords[1]}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const center = data.features[0].center as [number, number];
        if (proximityCoords && getDistanceKm(center, proximityCoords) > 35) {
          console.warn("Geocoded location too far from target city center, ignoring result:", addressStr, center);
          return null;
        }
        geocodeCache.set(key, center);
        return center;
      }
    }
  } catch (err) {
    console.warn("Geocoding failed for:", addressStr, err);
  }
  return null;
}

function getPropertyCoordinates(p: Property, index: number, geocodedMap?: Record<string, [number, number]>): [number, number] {
  if (p.lng && p.lat) return [p.lng, p.lat];
  if (geocodedMap && geocodedMap[p.id]) return geocodedMap[p.id];

  const locStr = `${p.location || ''} ${p.city || ''} ${p.state || ''} ${p.title || ''} ${p.subtitle || ''}`.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (locStr.includes(city)) {
      const offsetX = ((index % 5) - 2) * 0.002;
      const offsetY = (Math.floor(index / 5) - 1) * 0.002;
      return [coords[0] + offsetX, coords[1] + offsetY];
    }
  }

  const isHaldwaniArea = locStr.includes('haldwani') || locStr.includes('kham') || locStr.includes('ram darbar');
  const baseCenter: [number, number] = isHaldwaniArea ? [79.5130, 29.2183] : [78.0322, 30.3165];
  const offsetX = ((index % 5) - 2) * 0.002;
  const offsetY = (Math.floor(index / 5) - 1) * 0.002;
  return [baseCenter[0] + offsetX, baseCenter[1] + offsetY];
}

// ─── Property Card Overlay ─────────────────────────────────────────────────────
interface PropertyOverlayProps {
  property: Property;
  position: { x: number; y: number };
  containerW: number;
  containerH: number;
  onClose: () => void;
}

function PropertyOverlay({ property, position, containerW, containerH, onClose }: PropertyOverlayProps) {
  const imgUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop';
  const priceText = `₹${(property.price || 0).toLocaleString('en-IN')}`;
  const ratingDisplay = property.rating && Number(property.rating) > 0 ? Number(property.rating).toFixed(1) : null;

  const CARD_W = 280;
  const CARD_H = 360;
  const OFFSET_Y = 18;
  const PAD = 10; // inner padding from map edges

  // Preferred position: horizontally centered on marker, above the marker
  let left = position.x - CARD_W / 2;
  let top = position.y - CARD_H - OFFSET_Y;

  // Clamp all 4 edges strictly inside the map container
  if (left < PAD) left = PAD;
  if (left + CARD_W > containerW - PAD) left = containerW - CARD_W - PAD;
  if (top < PAD) top = PAD;
  if (top + CARD_H > containerH - PAD) top = containerH - CARD_H - PAD;

  // Arrow offset relative to card left edge (points at the actual marker x)
  const arrowLeft = Math.min(Math.max(position.x - left, 20), CARD_W - 20);

  return (
    <>
      {/* Transparent backdrop — clicking dismisses the card */}
      <div className="absolute inset-0 z-9990" onClick={onClose} />

      {/* Card positioned absolutely within the map container */}
      <div
        className="absolute z-9999"
        style={{
          left,
          top,
          width: CARD_W,
          animation: 'overlayIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main card */}
        <div
          className="bg-white rounded-2xl overflow-hidden border border-gray-100/80"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.10)' }}
        >
          {/* ── Image ── */}
          <div className="relative h-38.75 w-full overflow-hidden">
            <Image
              src={imgUrl}
              alt={property.title}
              fill
              className="object-cover"
              sizes="280px"
            />
            {/* gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

            {/* Rating */}
            {ratingDisplay && (
              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-[12px] font-bold text-gray-900">{ratingDisplay}</span>
                {property.reviews > 0 && (
                  <span className="text-[10px] text-gray-500">({property.reviews})</span>
                )}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={13} className="text-white" />
            </button>

            {/* Price badge on image */}
            <div className="absolute bottom-2.5 right-2.5 bg-white rounded-xl px-3 py-1.5 shadow-lg flex items-baseline gap-0.5">
              <span className="text-[14px] font-extrabold text-gray-900">{priceText}</span>
              <span className="text-[10px] font-medium text-gray-400">/night</span>
            </div>

            {/* Badges */}
            <div className="absolute top-2.5 right-10 flex gap-1">
              {property.isSuperhost && (
                <span className="bg-white/90 text-[10px] font-bold text-gray-800 rounded-full px-2 py-0.5 shadow-sm">Superhost</span>
              )}
              {property.isGuestFavorite && (
                <span className="bg-brand-coral/90 text-[10px] font-bold text-white rounded-full px-2 py-0.5 shadow-sm">★ Fav</span>
              )}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="p-3.5">
            <h3 className="text-[14px] font-bold text-gray-900 leading-snug truncate mb-1">
              {property.title}
            </h3>

            {property.location && (
              <div className="flex items-center gap-1 text-gray-500 mb-2.5">
                <MapPin size={11} className="shrink-0 text-brand-coral" />
                <span className="text-[12px] truncate">{property.location}</span>
              </div>
            )}

            {/* Room details row */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3.5">
              {(property.bedrooms ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Bed size={11} className="text-gray-400" />
                  {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                </span>
              )}
              {(property.bathrooms ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Bath size={11} className="text-gray-400" />
                  {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                </span>
              )}
              {property.freeCancellation && (
                <span className="text-emerald-600 font-semibold">Free cancel</span>
              )}
            </div>

            {/* CTA */}
            <Link
              href={`/property/${property.id}`}
              className="flex items-center justify-center gap-1.5 w-full bg-brand-navy hover:bg-brand-coral text-white text-[13px] font-bold py-2.5 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              View Property
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>
        </div>

        {/* Pointer arrow pointing down at the marker */}
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: arrowLeft - 8,
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '10px solid white',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.18))',
          }}
        />
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.88) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ─── Main MapMockup Component ──────────────────────────────────────────────────
interface MapMockupProps {
  properties?: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
}

interface OverlayState {
  property: Property;
  screenPos: { x: number; y: number };
}

export default function MapMockup({
  properties = [],
  selectedPropertyId = null,
  onSelectProperty,
}: MapMockupProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ id: string; marker: mapboxgl.Marker; coords: [number, number] }[]>([]);
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [geocodedMap, setGeocodedMap] = useState<Record<string, [number, number]>>({});
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  // Track container dimensions in state (safe to use in render)
  const [containerSize, setContainerSize] = useState({ w: 600, h: 500 });

  // Keep containerSize in sync with the map container's actual dimensions
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    // Set initial size
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Geocode addresses
  useEffect(() => {
    if (!properties || properties.length === 0) return;
    let isMounted = true;
    const resolveGeocodes = async () => {
      const updates: Record<string, [number, number]> = {};
      for (const prop of properties) {
        if (prop.lng && prop.lat) continue;
        const locText = `${prop.city || ''} ${prop.state || ''} ${prop.location || ''}`.toLowerCase();
        let cityCoords: [number, number] | undefined = undefined;
        for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
          if (locText.includes(cityKey)) { cityCoords = coords; break; }
        }
        const queryParts = [prop.city, prop.state, prop.location].filter(Boolean);
        const addressQuery = queryParts.length > 0 ? queryParts.join(", ") : prop.location;
        if (addressQuery) {
          const coords = await fetchAddressCoordinates(addressQuery, cityCoords);
          if (coords) updates[prop.id] = coords;
        }
      }
      if (isMounted && Object.keys(updates).length > 0) {
        setGeocodedMap(prev => ({ ...prev, ...updates }));
      }
    };
    resolveGeocodes();
    return () => { isMounted = false; };
  }, [properties]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    let initialCenter: [number, number] = [79.5130, 29.2183];
    if (properties && properties.length > 0) {
      initialCenter = getPropertyCoordinates(properties[0], 0, geocodedMap);
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: initialCenter,
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.on('moveend', () => setShowSearchAreaBtn(true));
    // Close overlay on map canvas click
    map.on('click', () => setOverlay(null));

    mapRef.current = map;
    return () => { map.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert LngLat coords → pixel position on screen
  const getScreenPos = useCallback((coords: [number, number]): { x: number; y: number } | null => {
    const map = mapRef.current;
    if (!map) return null;
    const point = map.project(coords as mapboxgl.LngLatLike);
    return { x: point.x, y: point.y };
  }, []);

  // Render price-pill markers
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];
    if (!properties || properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    properties.forEach((prop, i) => {
      const coords = getPropertyCoordinates(prop, i, geocodedMap);
      bounds.extend(coords);

      const isSelected = selectedPropertyId === prop.id;
      const priceText = `₹${(prop.price || 0).toLocaleString('en-IN')}`;

      const el = document.createElement('div');
      el.className = 'custom-realtime-marker';
      el.style.position = 'relative';
      el.style.zIndex = isSelected ? '50' : '10';
      el.innerHTML = `
        <button
          class="px-3 py-1.5 rounded-full font-bold text-[13px] shadow-lg transition-all duration-200 cursor-pointer ${
            isSelected
              ? 'bg-gray-900 text-white scale-125 ring-4 ring-brand-coral'
              : 'bg-white text-gray-900 border border-gray-200 hover:scale-110 hover:bg-gray-900 hover:text-white'
          }"
          style="white-space:nowrap; transform: translate(-50%,-50%);"
        >${priceText}</button>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectProperty) onSelectProperty(prop.id);
        const cardEl = document.getElementById(`property-card-${prop.id}`);
        if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const screenPos = getScreenPos(coords);
        if (screenPos) setOverlay({ property: prop, screenPos });
      });

      const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
      markersRef.current.push({ id: prop.id, marker, coords });
    });

    if (properties.length > 0 && !selectedPropertyId) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, animate: true });
    }
  }, [properties, geocodedMap, selectedPropertyId, onSelectProperty, getScreenPos]);

  // Keep overlay position in sync as map moves / zooms
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updatePos = () => {
      setOverlay(prev => {
        if (!prev) return null;
        const m = markersRef.current.find(m => m.id === prev.property.id);
        if (!m) return null;
        const newPos = getScreenPos(m.coords);
        if (!newPos) return null;
        return { ...prev, screenPos: newPos };
      });
    };
    map.on('move', updatePos);
    map.on('zoom', updatePos);
    return () => { map.off('move', updatePos); map.off('zoom', updatePos); };
  }, [getScreenPos]);

  // Fly to selected property
  useEffect(() => {
    if (!selectedPropertyId || !mapRef.current) return;
    const target = markersRef.current.find(m => m.id === selectedPropertyId);
    if (target) mapRef.current.flyTo({ center: target.coords, zoom: 14, animate: true });
  }, [selectedPropertyId]);

  // Re-render markers on dep changes
  useEffect(() => { renderMarkers(); }, [renderMarkers, mapStyle]);

  const handleStyleToggle = (style: 'streets' | 'satellite') => {
    if (mapStyle === style) return;
    setMapStyle(style);
    const map = mapRef.current;
    if (map) {
      map.setStyle(style === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/outdoors-v12');
      map.once('style.load', () => renderMarkers());
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const map = mapRef.current;
        if (map) {
          map.flyTo({ center: coords, zoom: 14, animate: true });
          new mapboxgl.Marker({ color: '#10B981' })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML('<strong style="padding:4px;display:block;">Your Location</strong>'))
            .addTo(map);
        }
      },
      (err) => console.warn("Geolocation failed:", err)
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Mapbox canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* ── Property card overlay (React-rendered) ─────────── */}
      {overlay && (
        <PropertyOverlay
          property={overlay.property}
          position={overlay.screenPos}
          containerW={containerSize.w}
          containerH={containerSize.h}
          onClose={() => setOverlay(null)}
        />
      )}

      {/* Search This Area button */}
      {showSearchAreaBtn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              setShowSearchAreaBtn(false);
              if (properties.length > 0 && mapRef.current) {
                const bounds = new mapboxgl.LngLatBounds();
                properties.forEach((p, i) => bounds.extend(getPropertyCoordinates(p, i, geocodedMap)));
                mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 13, animate: true });
              }
            }}
            className="bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-full shadow-xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔍</span> Search This Area
          </button>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg p-1 flex items-center gap-1 pointer-events-auto border border-gray-200">
          <button
            onClick={() => handleStyleToggle('streets')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              mapStyle === 'streets' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >🗺️ Street</button>
          <button
            onClick={() => handleStyleToggle('satellite')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              mapStyle === 'satellite' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >🛰️ Satellite</button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleUseMyLocation}
            className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-[12px] font-bold text-gray-800 hover:bg-gray-900 hover:text-white transition-all cursor-pointer flex items-center gap-1"
          >📍 My Location</button>

          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg px-3.5 py-1.5 flex items-center gap-2.5 border border-gray-200">
            <span className="text-[12px] font-semibold text-gray-800 whitespace-nowrap hidden sm:inline">Search as I move</span>
            <button
              onClick={() => setSearchAsMove(!searchAsMove)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                searchAsMove ? 'bg-gray-900 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
