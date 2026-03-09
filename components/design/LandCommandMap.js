import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri World Imagery'
    }
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }]
};

function toGeoJson(boundary) {
  if (!Array.isArray(boundary) || boundary.length < 3) return null;
  const closed = [...boundary, boundary[0]];
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [closed]
      }
    }]
  };
}

function getBBox(boundary) {
  if (!Array.isArray(boundary) || boundary.length < 3) return null;
  const lngs = boundary.map((p) => p[0]);
  const lats = boundary.map((p) => p[1]);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

function generateRoadAndPlotGrid(boundary) {
  const bbox = getBBox(boundary);
  if (!bbox) return { roads: { type: 'FeatureCollection', features: [] }, plots: { type: 'FeatureCollection', features: [] } };

  const [minLng, minLat, maxLng, maxLat] = bbox;
  const lngStep = (maxLng - minLng) / 5;
  const latStep = (maxLat - minLat) / 5;

  const roads = [];
  for (let i = 1; i < 5; i += 1) {
    roads.push({
      type: 'Feature',
      properties: { kind: 'road' },
      geometry: { type: 'LineString', coordinates: [[minLng + (lngStep * i), minLat], [minLng + (lngStep * i), maxLat]] }
    });
    roads.push({
      type: 'Feature',
      properties: { kind: 'road' },
      geometry: { type: 'LineString', coordinates: [[minLng, minLat + (latStep * i)], [maxLng, minLat + (latStep * i)]] }
    });
  }

  const plots = [];
  for (let x = 0; x < 5; x += 1) {
    for (let y = 0; y < 5; y += 1) {
      plots.push({
        type: 'Feature',
        properties: { id: `${x}-${y}` },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [minLng + (lngStep * x), minLat + (latStep * y)],
            [minLng + (lngStep * (x + 1)), minLat + (latStep * y)],
            [minLng + (lngStep * (x + 1)), minLat + (latStep * (y + 1))],
            [minLng + (lngStep * x), minLat + (latStep * (y + 1))],
            [minLng + (lngStep * x), minLat + (latStep * y)]
          ]]
        }
      });
    }
  }

  return {
    roads: { type: 'FeatureCollection', features: roads },
    plots: { type: 'FeatureCollection', features: plots }
  };
}

export default function LandCommandMap({ className = '', boundary = [], onBoundaryChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const drawModeRef = useRef(false);
  const boundaryRef = useRef(boundary || []);
  const [searchValue, setSearchValue] = useState('Lagos, Nigeria');
  const [drawMode, setDrawMode] = useState(false);
  const [localBoundary, setLocalBoundary] = useState(boundary || []);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const next = Array.isArray(boundary) ? boundary : [];
    setLocalBoundary(next);
    boundaryRef.current = next;
  }, [boundary]);

  const boundaryGeoJson = useMemo(() => toGeoJson(localBoundary), [localBoundary]);
  const overlays = useMemo(() => generateRoadAndPlotGrid(localBoundary), [localBoundary]);

  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (mapboxToken) mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapboxToken ? 'mapbox://styles/mapbox/satellite-streets-v12' : SATELLITE_STYLE,
      center: [3.3792, 6.5244],
      zoom: 14
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('parcel-boundary', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'parcel-fill', type: 'fill', source: 'parcel-boundary', paint: { 'fill-color': '#00d4ff', 'fill-opacity': 0.18 } });
      map.addLayer({ id: 'parcel-outline', type: 'line', source: 'parcel-boundary', paint: { 'line-color': '#4ff0ff', 'line-width': 3 } });

      map.addSource('scenario-roads', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'scenario-roads-layer', type: 'line', source: 'scenario-roads', paint: { 'line-color': '#f4c542', 'line-width': 1.4 } });

      map.addSource('scenario-plots', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'scenario-plots-layer', type: 'line', source: 'scenario-plots', paint: { 'line-color': '#89f4ff', 'line-width': 0.8, 'line-opacity': 0.6 } });
    });

    map.on('click', (event) => {
      if (!drawModeRef.current) return;
      const nextBoundary = [...(boundaryRef.current || []), [event.lngLat.lng, event.lngLat.lat]];
      setLocalBoundary(nextBoundary);
      onBoundaryChange?.(nextBoundary);
      boundaryRef.current = nextBoundary;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, onBoundaryChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('parcel-boundary')) return;

    map.getSource('parcel-boundary').setData(boundaryGeoJson || { type: 'FeatureCollection', features: [] });
    map.getSource('scenario-roads').setData(overlays.roads);
    map.getSource('scenario-plots').setData(overlays.plots);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    boundaryRef.current = localBoundary;

    localBoundary.forEach((point, index) => {
      const marker = new mapboxgl.Marker({ color: '#34e7ff', draggable: true })
        .setLngLat(point)
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const next = [...localBoundary];
        next[index] = [lngLat.lng, lngLat.lat];
        setLocalBoundary(next);
        onBoundaryChange?.(next);
      });

      markersRef.current.push(marker);
    });

    const bbox = getBBox(localBoundary);
    if (bbox) {
      map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: 800 });
    }
  }, [boundaryGeoJson, localBoundary, onBoundaryChange, overlays]);

  const runSearch = async (event) => {
    event.preventDefault();
    if (!searchValue.trim() || !mapRef.current) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}`);
    const payload = await response.json();
    if (!payload?.length) return;
    mapRef.current.flyTo({ center: [Number(payload[0].lon), Number(payload[0].lat)], zoom: 15 });
  };

  const clearBoundary = () => {
    setLocalBoundary([]);
    onBoundaryChange?.([]);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/15 bg-[#030f18]/90 px-3 py-2">
        <form className="flex flex-1 gap-2" onSubmit={runSearch}>
          <input className="w-full rounded-md border border-white/20 bg-[#071523] px-3 py-2 text-sm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search location or parcel context" />
          <button className="btn-secondary text-xs" type="submit">Locate</button>
        </form>
        <button className={`rounded-md px-3 py-2 text-xs ${drawMode ? 'bg-cyan-300 text-slate-900' : 'bg-slate-800 text-cyan-100'}`} onClick={() => setDrawMode((v) => !v)} type="button">{drawMode ? 'Drawing ON' : 'Draw boundary'}</button>
        <button className="rounded-md border border-white/20 px-3 py-2 text-xs text-cyan-100" onClick={clearBoundary} type="button">Clear</button>
      </div>
      <div ref={containerRef} className="h-full min-h-[360px] w-full" />
    </div>
  );
}
