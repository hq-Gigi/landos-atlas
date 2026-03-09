const stable = (n) => Math.round(n * 1e6) / 1e6;

export function normalizeParcel(points = []) {
  return points.map((p) => ({ lat: stable(Number(p.lat || p[1] || 0)), lng: stable(Number(p.lng || p[0] || 0)) }));
}

export function polygonArea(points = []) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.lng * b.lat - b.lng * a.lat;
  }
  return Math.abs(area / 2);
}

function bbox(points = []) {
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
}

export function buildScenarioGeometry(parcel = [], { variant = 0, objective = 'BALANCED' } = {}) {
  const normalized = normalizeParcel(parcel);
  const area = polygonArea(normalized);
  const lotScale = objective === 'MAX_YIELD' ? 220000 : objective === 'FAST_DELIVERY' ? 150000 : 180000;
  const plots = Math.max(8, Math.floor(area * lotScale));
  const reserveRatio = objective === 'PREMIUM' ? 0.16 : 0.12;

  const bounds = normalized.length ? bbox(normalized) : { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 };
  const cols = Math.max(3, Math.round(Math.sqrt(plots) / 2) + variant);
  const rows = Math.max(3, Math.round(plots / cols));
  const lngStep = (bounds.maxLng - bounds.minLng || 1) / cols;
  const latStep = (bounds.maxLat - bounds.minLat || 1) / rows;

  const roadLines = [];
  for (let c = 1; c < cols; c += 2) {
    roadLines.push([[bounds.minLng + lngStep * c, bounds.minLat], [bounds.minLng + lngStep * c, bounds.maxLat]]);
  }
  for (let r = 1; r < rows; r += 2) {
    roadLines.push([[bounds.minLng, bounds.minLat + latStep * r], [bounds.maxLng, bounds.minLat + latStep * r]]);
  }

  const plotGrid = [];
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const p1 = [bounds.minLng + lngStep * c, bounds.minLat + latStep * r];
      const p2 = [bounds.minLng + lngStep * (c + 1), bounds.minLat + latStep * r];
      const p3 = [bounds.minLng + lngStep * (c + 1), bounds.minLat + latStep * (r + 1)];
      const p4 = [bounds.minLng + lngStep * c, bounds.minLat + latStep * (r + 1)];
      plotGrid.push([p1, p2, p3, p4, p1]);
    }
  }

  const avgLotArea = plots ? stable((area * 111_000 * 111_000 * 0.55) / plots) : 0;

  return {
    area,
    plots,
    reserves: Math.round(plots * reserveRatio),
    roads: roadLines.length,
    avgLotArea,
    minLotArea: stable(avgLotArea * 0.84),
    maxLotArea: stable(avgLotArea * 1.22),
    frontageQuality: stable(0.65 + Math.min(0.3, normalized.length / 100)),
    roadNetwork: {
      pattern: variant === 0 ? 'spine-grid' : variant === 1 ? 'loop-cluster' : 'hybrid-grid',
      efficiency: stable(0.62 + (roadLines.length / Math.max(6, plots)) * 12)
    },
    roadLines,
    plotGrid,
    serialization: JSON.stringify({ normalized, area, plots, roadLines: roadLines.length })
  };
}
