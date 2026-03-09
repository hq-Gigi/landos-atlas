import { useEffect, useMemo, useRef, useState } from 'react';

const MAPBOX_GL_SCRIPT_ID = 'mapbox-gl-script';
const MAPBOX_GL_CSS_ID = 'mapbox-gl-css';
const MAPBOX_GL_SCRIPT_SRC = 'https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js';
const MAPBOX_GL_CSS_HREF = 'https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css';
const DEFAULT_CENTER = [3.3792, 6.5244];

const layerGroups = {
  roads: ['road', 'street', 'motorway', 'highway'],
  buildings: ['building'],
  water: ['water'],
  boundaries: ['admin', 'boundary', 'settlement-subdivision'],
  utilities: ['power', 'pipeline', 'utility']
};

function ensureMapboxAssets() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);

  if (!document.getElementById(MAPBOX_GL_CSS_ID)) {
    const link = document.createElement('link');
    link.id = MAPBOX_GL_CSS_ID;
    link.rel = 'stylesheet';
    link.href = MAPBOX_GL_CSS_HREF;
    document.head.appendChild(link);
  }

  const existingScript = document.getElementById(MAPBOX_GL_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.mapboxgl), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Mapbox GL JS.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = MAPBOX_GL_SCRIPT_ID;
    script.src = MAPBOX_GL_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = () => reject(new Error('Failed to load Mapbox GL JS.'));
    document.body.appendChild(script);
  });
}

function normalizePoint(point) {
  if (Array.isArray(point)) return { lng: Number(point[0]), lat: Number(point[1]) };
  return { lng: Number(point?.lng), lat: Number(point?.lat) };
}

function normalizeBoundary(boundary = []) {
  if (!Array.isArray(boundary)) return [];
  return boundary.map(normalizePoint).filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat));
}

function calculateMetrics(boundary = []) {
  const normalized = normalizeBoundary(boundary);
  if (normalized.length < 3) return { area: 0, perimeter: 0, frontage: 0, slope: null };
  const latScale = 111320;
  const avgLat = (normalized.reduce((sum, p) => sum + p.lat, 0) / normalized.length) * (Math.PI / 180);
  const lngScale = 111320 * Math.cos(avgLat);

  const cartesian = normalized.map((point) => ({ x: point.lng * lngScale, y: point.lat * latScale }));
  let areaAccumulator = 0;
  let perimeter = 0;
  let frontage = 0;

  for (let i = 0; i < cartesian.length; i += 1) {
    const next = (i + 1) % cartesian.length;
    const a = cartesian[i];
    const b = cartesian[next];
    const edgeLength = Math.hypot(b.x - a.x, b.y - a.y);
    areaAccumulator += (a.x * b.y) - (b.x * a.y);
    perimeter += edgeLength;
    frontage = Math.max(frontage, edgeLength);
  }

  return {
    area: Math.abs(areaAccumulator / 2),
    perimeter,
    frontage,
    slope: null
  };
}

function toGeoJson(boundary) {
  const normalized = normalizeBoundary(boundary);
  if (normalized.length < 3) return null;
  const closed = [...normalized, normalized[0]].map((point) => [point.lng, point.lat]);
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [closed] } }]
  };
}

function getBBox(boundary) {
  const normalized = normalizeBoundary(boundary);
  if (normalized.length < 3) return null;
  const lngs = normalized.map((p) => p.lng);
  const lats = normalized.map((p) => p.lat);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

function parseCoordinateSearch(searchValue) {
  const candidate = searchValue.trim();
  if (!candidate) return null;
  const stripped = candidate.replace(/[()]/g, '');
  const parts = stripped.split(',').map((v) => Number(v.trim()));
  if (parts.length !== 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  const [a, b] = parts;
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lng: b, lat: a };
  if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return { lng: a, lat: b };
  return null;
}

function importBoundaryFromGeoJson(raw) {
  const payload = JSON.parse(raw);
  const feature = payload?.type === 'FeatureCollection' ? payload.features?.[0] : payload;
  const polygon = feature?.geometry?.type === 'Polygon' ? feature.geometry.coordinates?.[0] : null;
  if (!Array.isArray(polygon)) return [];
  return polygon.slice(0, -1).map(([lng, lat]) => ({ lng: Number(lng), lat: Number(lat) })).filter((p) => Number.isFinite(p.lng) && Number.isFinite(p.lat));
}

function buildCandidateParcels(center, filters) {
  if (!center) return { type: 'FeatureCollection', features: [] };
  const kmStep = 0.009;
  const features = Array.from({ length: 8 }).map((_, idx) => {
    const x = idx % 4;
    const y = Math.floor(idx / 4);
    const lng = center.lng + ((x - 1.5) * kmStep * 1.8);
    const lat = center.lat + ((y - 0.5) * kmStep * 1.6);
    const sizeHa = Number(filters.sizeMin || 1) + idx;
    return {
      type: 'Feature',
      properties: { id: `candidate-${idx + 1}`, sizeHa, potential: Number(filters.potential || 70) + ((idx % 3) * 5) },
      geometry: {
        type: 'Polygon',
        coordinates: [[[lng, lat], [lng + kmStep, lat], [lng + kmStep, lat + kmStep], [lng, lat + kmStep], [lng, lat]]]
      }
    };
  });

  return { type: 'FeatureCollection', features };
}

function applyGroupVisibility(map, enabledGroups) {
  const layers = map.getStyle()?.layers || [];
  layers.forEach((layer) => {
    const slug = [layer.id, layer['source-layer']].filter(Boolean).join(' ').toLowerCase();
    Object.entries(layerGroups).forEach(([group, matches]) => {
      if (!matches.some((entry) => slug.includes(entry))) return;
      map.setLayoutProperty(layer.id, 'visibility', enabledGroups[group] ? 'visible' : 'none');
    });
  });
}

export default function LandCommandMap({ className = '', boundary = [], scenario = null, onBoundaryChange, onParcelMetricsChange, projects = [], showProjectMarkers = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const drawModeRef = useRef(false);
  const mapboxRef = useRef(null);
  const boundaryRef = useRef(normalizeBoundary(boundary));
  const [searchValue, setSearchValue] = useState('Lagos, Nigeria');
  const [drawMode, setDrawMode] = useState(false);
  const [localBoundary, setLocalBoundary] = useState(normalizeBoundary(boundary));
  const [mapboxLoadError, setMapboxLoadError] = useState('');
  const [coordinateInput, setCoordinateInput] = useState('');
  const [candidateFilters, setCandidateFilters] = useState({ sizeMin: 2, roadProximityKm: 1, cityProximityKm: 20, potential: 75 });
  const [candidateGeoJson, setCandidateGeoJson] = useState({ type: 'FeatureCollection', features: [] });
  const [layersEnabled, setLayersEnabled] = useState({ roads: true, buildings: true, water: true, boundaries: true, terrain: false, utilities: false, parcels: true, scenarios: true, candidates: true, projects: true });
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const next = normalizeBoundary(boundary);
    setLocalBoundary(next);
    boundaryRef.current = next;
  }, [boundary]);

  const boundaryGeoJson = useMemo(() => toGeoJson(localBoundary), [localBoundary]);

  useEffect(() => {
    onParcelMetricsChange?.(calculateMetrics(localBoundary));
  }, [localBoundary, onParcelMetricsChange]);

  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let destroyed = false;
    ensureMapboxAssets().then((mapboxgl) => {
      if (destroyed || !mapboxgl || !containerRef.current) return;
      mapboxRef.current = mapboxgl;
      setMapboxLoadError('');
      if (mapboxToken) mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: mapboxToken ? 'mapbox://styles/mapbox/satellite-streets-v12' : { version: 8, sources: { satellite: { type: 'raster', tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } }, layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }] },
        center: DEFAULT_CENTER,
        zoom: 12,
        antialias: true
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapRef.current = map;

      map.on('load', () => {
        map.addSource('parcel-boundary', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'parcel-fill', type: 'fill', source: 'parcel-boundary', paint: { 'fill-color': '#00d4ff', 'fill-opacity': 0.15 } });
        map.addLayer({ id: 'parcel-outline', type: 'line', source: 'parcel-boundary', paint: { 'line-color': '#4ff0ff', 'line-width': 3 } });

        map.addSource('candidate-parcels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'candidate-fill', type: 'fill', source: 'candidate-parcels', paint: { 'fill-color': '#98f5a9', 'fill-opacity': 0.22 } });
        map.addLayer({ id: 'candidate-outline', type: 'line', source: 'candidate-parcels', paint: { 'line-color': '#71d885', 'line-width': 1.6 } });

        if (mapboxToken) {
          map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.1 });
        }
        applyGroupVisibility(map, layersEnabled);
      });

      map.on('click', (event) => {
        if (!drawModeRef.current) return;
        const nextBoundary = [...(boundaryRef.current || []), { lng: event.lngLat.lng, lat: event.lngLat.lat }];
        setLocalBoundary(nextBoundary);
        onBoundaryChange?.(nextBoundary);
        boundaryRef.current = nextBoundary;
      });
    }).catch(() => setMapboxLoadError('Map preview is unavailable right now.'));

    return () => {
      destroyed = true;
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, [layersEnabled, mapboxToken, onBoundaryChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('parcel-boundary')) return;
    map.getSource('parcel-boundary').setData(boundaryGeoJson || { type: 'FeatureCollection', features: [] });
    map.getSource('candidate-parcels')?.setData(candidateGeoJson);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    localBoundary.forEach((point, index) => {
      const marker = new mapboxRef.current.Marker({ color: '#34e7ff', draggable: true }).setLngLat([point.lng, point.lat]).addTo(map);
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const next = [...localBoundary];
        next[index] = { lng: lngLat.lng, lat: lngLat.lat };
        setLocalBoundary(next);
        onBoundaryChange?.(next);
      });
      markersRef.current.push(marker);
    });

    if (showProjectMarkers) {
      projects.forEach((project) => {
        const point = normalizePoint(project.center || project.boundary?.[0] || {});
        if (!Number.isFinite(point.lng) || !Number.isFinite(point.lat)) return;
        const el = document.createElement('div');
        el.className = 'h-3 w-3 rounded-full border border-white bg-emerald-300';
        const marker = new mapboxRef.current.Marker({ element: el }).setLngLat([point.lng, point.lat]).setPopup(new mapboxRef.current.Popup({ closeButton: false }).setText(`${project.name || 'Project'} · ${project.status || 'Active'}`)).addTo(map);
        markersRef.current.push(marker);
      });
    }

    const bbox = getBBox(localBoundary);
    if (bbox) map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: 700 });
  }, [boundaryGeoJson, candidateGeoJson, localBoundary, onBoundaryChange, projects, showProjectMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    applyGroupVisibility(map, layersEnabled);
    if (mapboxToken && map.getTerrain()) map.setTerrain({ source: 'mapbox-dem', exaggeration: layersEnabled.terrain ? 1.2 : 1.0 });
    ['parcel-fill', 'parcel-outline'].forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', layersEnabled.parcels ? 'visible' : 'none'));
    ['candidate-fill', 'candidate-outline'].forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', layersEnabled.candidates ? 'visible' : 'none'));
  }, [layersEnabled, mapboxToken]);

  const runSearch = async (event) => {
    event.preventDefault();
    if (!searchValue.trim() || !mapRef.current) return;
    const direct = parseCoordinateSearch(searchValue);
    if (direct) {
      mapRef.current.flyTo({ center: [direct.lng, direct.lat], zoom: 14 });
      return;
    }
    const payload = await fetch(`/api/geo/search?q=${encodeURIComponent(searchValue)}`).then((res) => res.json());
    if (Array.isArray(payload) && payload.length) mapRef.current.flyTo({ center: [payload[0].lng, payload[0].lat], zoom: 13 });
  };

  const importCoordinates = () => {
    const parsed = coordinateInput.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => line.split(',').map((item) => Number(item.trim()))).filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1])).map(([lng, lat]) => ({ lng, lat }));
    setLocalBoundary(parsed);
    onBoundaryChange?.(parsed);
  };

  const importShapeFile = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = importBoundaryFromGeoJson(raw);
      if (!parsed.length) throw new Error('No polygon geometry found in file.');
      setLocalBoundary(parsed);
      onBoundaryChange?.(parsed);
      setMapboxLoadError('');
    } catch {
      setMapboxLoadError('Could not import shape. Upload GeoJSON polygon data from your shapefile export.');
    }
  };

  const discoverCandidateParcels = () => {
    const center = localBoundary[0] || (() => {
      const c = mapRef.current?.getCenter();
      return c ? { lng: c.lng, lat: c.lat } : null;
    })();
    setCandidateGeoJson(buildCandidateParcels(center, candidateFilters));
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/15 bg-[#030f18]/90 px-3 py-2">
        <form className="flex flex-1 gap-2" onSubmit={runSearch}>
          <input className="w-full rounded-md border border-white/20 bg-[#071523] px-3 py-2 text-sm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search city, region, or coordinates" />
          <button className="btn-secondary text-xs" type="submit">Locate</button>
        </form>
        <button className={`rounded-md px-3 py-2 text-xs ${drawMode ? 'bg-cyan-300 text-slate-900' : 'bg-slate-800 text-cyan-100'}`} onClick={() => setDrawMode((v) => !v)} type="button">{drawMode ? 'Drawing ON' : 'Trace parcel'}</button>
      </div>
      <div className="grid gap-2 border-b border-white/10 bg-[#04111b]/95 px-3 py-2 text-xs md:grid-cols-5">
        {Object.keys(layersEnabled).map((key) => (
          <label key={key} className="flex items-center gap-1 text-cyan-100/90">
            <input type="checkbox" checked={layersEnabled[key]} onChange={(e) => setLayersEnabled((prev) => ({ ...prev, [key]: e.target.checked }))} />
            {key}
          </label>
        ))}
      </div>
      <div className="grid gap-2 border-b border-white/10 bg-[#04111b]/80 px-3 py-2 md:grid-cols-3">
        <textarea className="min-h-[90px] rounded border border-white/10 bg-[#061320] p-2 text-xs" placeholder="Import coordinates (lng,lat per line)" value={coordinateInput} onChange={(e) => setCoordinateInput(e.target.value)} />
        <div className="space-y-2 text-xs">
          <button className="btn-secondary w-full" type="button" onClick={importCoordinates}>Import coordinates</button>
          <label className="block rounded border border-white/20 px-2 py-2 text-center text-cyan-100">Import shapefile export (GeoJSON)
            <input type="file" accept=".json,.geojson" className="hidden" onChange={importShapeFile} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input className="rounded border border-white/20 bg-[#071523] px-2 py-1" value={candidateFilters.sizeMin} onChange={(e) => setCandidateFilters((f) => ({ ...f, sizeMin: Number(e.target.value) }))} placeholder="Min size ha" />
          <input className="rounded border border-white/20 bg-[#071523] px-2 py-1" value={candidateFilters.potential} onChange={(e) => setCandidateFilters((f) => ({ ...f, potential: Number(e.target.value) }))} placeholder="Potential" />
          <button className="btn-primary col-span-2" type="button" onClick={discoverCandidateParcels}>Discover parcels</button>
        </div>
      </div>
      {mapboxLoadError ? <div className="px-3 py-2 text-xs text-amber-300">{mapboxLoadError}</div> : null}
      <div ref={containerRef} className="h-full min-h-[420px] w-full" />
    </div>
  );
}
