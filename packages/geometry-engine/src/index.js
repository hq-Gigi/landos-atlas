const stable = (n) => Math.round(n * 1e6) / 1e6;

export function normalizeParcel(points = []) {
  return points.map((p) => ({ lat: stable(Number(p.lat || 0)), lng: stable(Number(p.lng || 0)) }));
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

export function buildScenarioGeometry(parcel = []) {
  const normalized = normalizeParcel(parcel);
  const area = polygonArea(normalized);
  const plots = Math.max(8, Math.floor(area * 180000));
  const roadRatio = 0.18;
  const reserveRatio = 0.12;
  return {
    area,
    plots,
    reserves: Math.round(plots * reserveRatio),
    roads: Math.round(plots * roadRatio),
    frontageQuality: stable(0.65 + Math.min(0.3, normalized.length / 100)),
    serialization: JSON.stringify({ normalized, area, plots })
  };
}
