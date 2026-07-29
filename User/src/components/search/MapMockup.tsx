"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Property } from '@/components/search/PropertyCard';

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
  const R = 6371; // Earth radius in km
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
        const center = data.features[0].center as [number, number]; // [lng, lat]
        // If proximityCoords provided, verify distance is within 35km (prevents jumps to Chandigarh/other states)
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

  // Fallback centered near Haldwani if Haldwani is in city/state or default to Haldwani/North India
  const isHaldwaniArea = locStr.includes('haldwani') || locStr.includes('kham') || locStr.includes('ram darbar');
  const baseCenter: [number, number] = isHaldwaniArea ? [79.5130, 29.2183] : [78.0322, 30.3165];
  const offsetX = ((index % 5) - 2) * 0.002;
  const offsetY = (Math.floor(index / 5) - 1) * 0.002;
  return [baseCenter[0] + offsetX, baseCenter[1] + offsetY];
}

interface MapMockupProps {
  properties?: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string) => void;
}

export default function MapMockup({ 
  properties = [], 
  selectedPropertyId = null, 
  onSelectProperty 
}: MapMockupProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ id: string; marker: mapboxgl.Marker; coords: [number, number] }[]>([]);
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [geocodedMap, setGeocodedMap] = useState<Record<string, [number, number]>>({});

  // Geocode property addresses asynchronously with city proximity bias
  useEffect(() => {
    if (!properties || properties.length === 0) return;

    let isMounted = true;
    const resolveGeocodes = async () => {
      const updates: Record<string, [number, number]> = {};
      for (const prop of properties) {
        if (prop.lng && prop.lat) continue;

        // Find city center for proximity bias
        const locText = `${prop.city || ''} ${prop.state || ''} ${prop.location || ''}`.toLowerCase();
        let cityCoords: [number, number] | undefined = undefined;
        for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
          if (locText.includes(cityKey)) {
            cityCoords = coords;
            break;
          }
        }

        // Format query string with City & State FIRST to anchor search locally
        const queryParts = [prop.city, prop.state, prop.location].filter(Boolean);
        const addressQuery = queryParts.length > 0 ? queryParts.join(", ") : prop.location;

        if (addressQuery) {
          const coords = await fetchAddressCoordinates(addressQuery, cityCoords);
          if (coords) {
            updates[prop.id] = coords;
          }
        }
      }
      if (isMounted && Object.keys(updates).length > 0) {
        setGeocodedMap(prev => ({ ...prev, ...updates }));
      }
    };

    resolveGeocodes();
    return () => { isMounted = false; };
  }, [properties]);

  // Initialize Mapbox map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    let initialCenter: [number, number] = [79.5130, 29.2183]; // Default to Haldwani center if present
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
    
    map.on('moveend', () => {
      setShowSearchAreaBtn(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Function to render markers on the current map
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];

    if (!properties || properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    properties.forEach((prop, i) => {
      const coords = getPropertyCoordinates(prop, i, geocodedMap);
      bounds.extend(coords);

      const isSelected = selectedPropertyId === prop.id;
      const priceText = `₹${(prop.price || 0).toLocaleString('en-IN')}`;
      const imgUrl = prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop';

      // Create Marker element
      const el = document.createElement('div');
      el.className = 'custom-realtime-marker';
      el.innerHTML = `
        <button class="px-3 py-1.5 rounded-full font-bold text-[13px] shadow-lg transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
          isSelected 
            ? 'bg-gray-900 text-white scale-125 ring-4 ring-brand-coral z-50' 
            : 'bg-white text-gray-900 border border-gray-200 hover:scale-110 hover:bg-gray-900 hover:text-white'
        }">
          ${priceText}
        </button>
      `;

      // Create Popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
        <div style="width: 200px; padding: 4px;">
          <img src="${imgUrl}" alt="${prop.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />
          <div style="font-weight: bold; font-size: 14px; color: #111827; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${prop.title}</div>
          <div style="font-size: 12px; color: #4B5563; margin-bottom: 6px;">${prop.location || ''}</div>
          <div style="display: flex; justify-content: space-between; items-center;">
            <div style="font-weight: bold; font-size: 14px; color: #111827;">${priceText} <span style="font-weight: normal; font-size: 12px; color: #6B7280;">/ night</span></div>
            <div style="font-size: 12px; font-weight: bold; color: #E86A70;">★ ${prop.rating ? prop.rating.toFixed(1) : 'New'}</div>
          </div>
          <a href="/property/${prop.id}" style="display: block; margin-top: 8px; text-align: center; background-color: #1F2E4A; color: white; border-radius: 8px; padding: 6px 0; font-size: 12px; font-weight: bold; text-decoration: none;">View Details</a>
        </div>
      `);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSelectProperty) onSelectProperty(prop.id);
        const cardEl = document.getElementById(`property-card-${prop.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push({ id: prop.id, marker, coords });
    });

    if (properties.length > 0 && !selectedPropertyId) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, animate: true });
    }
  }, [properties, geocodedMap, selectedPropertyId, onSelectProperty]);

  // Sync selectedPropertyId marker click/flyTo
  useEffect(() => {
    if (!selectedPropertyId || !mapRef.current) return;
    const target = markersRef.current.find(m => m.id === selectedPropertyId);
    if (target) {
      mapRef.current.flyTo({ center: target.coords, zoom: 14, animate: true });
      target.marker.togglePopup();
    }
  }, [selectedPropertyId]);

  // Render markers when properties change or style reloads
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers, mapStyle]);

  // Switch map style
  const handleStyleToggle = (style: 'streets' | 'satellite') => {
    if (mapStyle === style) return;
    setMapStyle(style);
    const map = mapRef.current;
    if (map) {
      const styleUrl = style === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/outdoors-v12';

      map.setStyle(styleUrl);
      map.once('style.load', () => {
        renderMarkers();
      });
    }
  };

  // Locate user position
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
            .setPopup(new mapboxgl.Popup().setHTML('<strong style="padding: 4px; display: block;">Your Location</strong>'))
            .addTo(map);
        }
      },
      (err) => console.warn("Geolocation failed:", err)
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Mapbox Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating "Search This Area" Button */}
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

      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
        {/* Street vs Satellite View Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg p-1 flex items-center gap-1 pointer-events-auto border border-gray-200">
          <button
            onClick={() => handleStyleToggle('streets')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              mapStyle === 'streets'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🗺️ Street
          </button>
          <button
            onClick={() => handleStyleToggle('satellite')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              mapStyle === 'satellite'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🛰️ Satellite
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Use My Location Button */}
          <button
            onClick={handleUseMyLocation}
            className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-[12px] font-bold text-gray-800 hover:bg-gray-900 hover:text-white transition-all cursor-pointer flex items-center gap-1"
          >
            📍 My Location
          </button>

          {/* Search as I move map toggle */}
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
