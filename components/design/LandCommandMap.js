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



function scenarioPalette(scenarioName = '') {
  if (scenarioName === 'MAX_YIELD') return { road: '#f59e0b', plotLine: '#60a5fa', plotFill: '#2563eb' };
  if (scenarioName === 'PREMIUM_LAYOUT') return { road: '#fde047', plotLine: '#34d399', plotFill: '#059669' };
  return { road: '#f8d26a', plotLine: '#94b8ff', plotFill: '#4f46e5' };
}
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

export default function LandCommandMap({ className = '', boundary = [], scenario = null, onBoundaryChange, onParcelMetricsChange, projects = [], showProjectMarkers = false, discoveryMode = false, discoveryParcels = [], onDiscoveryParcelClick, onDiscoveryScan }) {
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
  const [layersEnabled, setLayersEnabled] = useState({ roads: true, buildings: true, water: true, boundaries: true, terrain: false, utilities: false, parcels: true, scenarios: true, projects: true });
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const next = normalizeBoundary(boundary);
    setLocalBoundary(next);
    boundaryRef.current = next;
  }, [boundary]);

  const boundaryGeoJson = useMemo(() => toGeoJson(localBoundary), [localBoundary]);
  const discoveryGeoJson = useMemo(() => ({
    type: 'FeatureCollection',
    features: (discoveryParcels || []).map((parcel) => ({
      type: 'Feature',
      properties: {
        id: parcel.id,
        title: parcel.title,
        opportunityScore: parcel.opportunityScore,
        recommendation: parcel.scenarioRecommendation,
        estimatedYield: parcel.estimatedDevelopmentYield,
        area: parcel.area,
        frontage: parcel.frontage
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[...(parcel.boundary || []).map((point) => [point.lng, point.lat]), [parcel.boundary?.[0]?.lng, parcel.boundary?.[0]?.lat]]]
      }
    })).filter((feature) => feature.geometry.coordinates[0].length > 3)
  }), [discoveryParcels]);
  const scenarioFeatures = useMemo(() => {
    const roads = (scenario?.layout?.roadLines || []).map((line, index) => ({
      type: 'Feature',
      properties: { kind: 'road', id: `road-${index}` },
      geometry: { type: 'LineString', coordinates: line }
    }));
    const plots = (scenario?.layout?.plotGrid || []).map((plot, index) => ({
      type: 'Feature',
      properties: { kind: 'plot', id: `plot-${index}` },
      geometry: { type: 'Polygon', coordinates: [plot] }
    }));
    return [...roads, ...plots];
  }, [scenario]);

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

        map.addSource('scenario-roads', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'scenario-roads', type: 'line', source: 'scenario-roads', paint: { 'line-color': '#f8d26a', 'line-width': 2.4, 'line-opacity': 0.9 } });

        map.addSource('scenario-plots', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: 'scenario-plots-fill', type: 'fill', source: 'scenario-plots', paint: { 'fill-color': '#4f46e5', 'fill-opacity': 0.2 } });
        map.addLayer({ id: 'scenario-plots', type: 'line', source: 'scenario-plots', paint: { 'line-color': '#94b8ff', 'line-width': 1.1, 'line-opacity': 0.9 } });

        map.addSource('opportunity-parcels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({
          id: 'opportunity-parcels-fill',
          type: 'fill',
          source: 'opportunity-parcels',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'opportunityScore'],
              0, '#1e3a8a',
              50, '#f59e0b',
              80, '#ef4444',
              100, '#f97316'
            ],
            'fill-opacity': 0.36
          }
        });
        map.addLayer({ id: 'opportunity-parcels-outline', type: 'line', source: 'opportunity-parcels', paint: { 'line-color': '#f8fafc', 'line-width': 1.5, 'line-opacity': 0.7 } });

        map.on('click', 'opportunity-parcels-fill', (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          onDiscoveryParcelClick?.(feature.properties);
        });
        map.on('mouseenter', 'opportunity-parcels-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'opportunity-parcels-fill', () => { map.getCanvas().style.cursor = ''; });

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
  }, [layersEnabled, mapboxToken, onBoundaryChange, onDiscoveryParcelClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('parcel-boundary')) return;
    map.getSource('parcel-boundary').setData(boundaryGeoJson || { type: 'FeatureCollection', features: [] });
    map.getSource('scenario-roads')?.setData({ type: 'FeatureCollection', features: scenarioFeatures.filter((f) => f.properties.kind === 'road') });
    map.getSource('scenario-plots')?.setData({ type: 'FeatureCollection', features: scenarioFeatures.filter((f) => f.properties.kind === 'plot') });
    map.getSource('opportunity-parcels')?.setData(discoveryGeoJson);

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
  }, [boundaryGeoJson, discoveryGeoJson, localBoundary, onBoundaryChange, projects, scenarioFeatures, showProjectMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    applyGroupVisibility(map, layersEnabled);
    if (mapboxToken && map.getTerrain()) map.setTerrain({ source: 'mapbox-dem', exaggeration: layersEnabled.terrain ? 1.2 : 1.0 });
    ['parcel-fill', 'parcel-outline'].forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', layersEnabled.parcels ? 'visible' : 'none'));
    ['scenario-roads', 'scenario-plots-fill', 'scenario-plots'].forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', layersEnabled.scenarios ? 'visible' : 'none'));
    ['opportunity-parcels-fill', 'opportunity-parcels-outline'].forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', discoveryMode ? 'visible' : 'none'));
  }, [discoveryMode, layersEnabled, mapboxToken]);



  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const palette = scenarioPalette(scenario?.name);
    if (map.getLayer('scenario-roads')) map.setPaintProperty('scenario-roads', 'line-color', palette.road);
    if (map.getLayer('scenario-plots')) map.setPaintProperty('scenario-plots', 'line-color', palette.plotLine);
    if (map.getLayer('scenario-plots-fill')) map.setPaintProperty('scenario-plots-fill', 'fill-color', palette.plotFill);
  }, [scenario]);
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

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/15 bg-[#030f18]/90 px-3 py-2">
        <form className="flex flex-1 gap-2" onSubmit={runSearch}>
          <input className="w-full rounded-md border border-white/20 bg-[#071523] px-3 py-2 text-sm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search city, region, or coordinates" />
          <button className="btn-secondary text-xs" type="submit">Locate</button>
        </form>
        {discoveryMode ? <button className="rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold text-slate-900" type="button" onClick={() => {
          const center = mapRef.current?.getCenter();
          const bounds = mapRef.current?.getBounds();
          onDiscoveryScan?.({
            center: center ? { lng: center.lng, lat: center.lat } : null,
            bounds: bounds ? { west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() } : null,
            query: searchValue
          });
        }}>Scan opportunities</button> : null}
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
      <div className="grid gap-2 border-b border-white/10 bg-[#04111b]/80 px-3 py-2 md:grid-cols-2">
        <textarea className="min-h-[90px] rounded border border-white/10 bg-[#061320] p-2 text-xs" placeholder="Import coordinates (lng,lat per line)" value={coordinateInput} onChange={(e) => setCoordinateInput(e.target.value)} />
        <div className="space-y-2 text-xs">
          <button className="btn-secondary w-full" type="button" onClick={importCoordinates}>Import coordinates</button>
          <label className="block rounded border border-white/20 px-2 py-2 text-center text-cyan-100">Import shapefile export (GeoJSON)
            <input type="file" accept=".json,.geojson" className="hidden" onChange={importShapeFile} />
          </label>
        </div>
      </div>
      {mapboxLoadError ? <div className="px-3 py-2 text-xs text-amber-300">{mapboxLoadError}</div> : null}
      <div ref={containerRef} className="h-full min-h-[420px] w-full" />
    </div>
  );
}
