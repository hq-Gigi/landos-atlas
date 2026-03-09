const stable = (n) => Math.round(n * 1e6) / 1e6;

export function normalizeParcel(points = []) {
  return points
    .map((p) => ({ lat: stable(Number(p.lat || p[1] || 0)), lng: stable(Number(p.lng || p[0] || 0)) }))
    .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
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

function objectiveProfile(objective = 'BALANCED') {
  if (objective === 'MAX_YIELD') return { plotMultiplier: 0.86, roadInterval: 5 };
  if (objective === 'PREMIUM_LAYOUT' || objective === 'PREMIUM') return { plotMultiplier: 1.28, roadInterval: 3 };
  if (objective === 'FAST_DEVELOPMENT' || objective === 'FAST_DELIVERY') return { plotMultiplier: 1.12, roadInterval: 6 };
  return { plotMultiplier: 1, roadInterval: 4 };
}

export function buildScenarioGeometry(parcel = [], {
  variant = 0,
  objective = 'BALANCED',
  targetPlotSize = 500,
  roadWidth = 9,
  minFrontage = 12
} = {}) {
  const normalized = normalizeParcel(parcel);
  const bounds = normalized.length ? bbox(normalized) : { minLng: 0, maxLng: 1, minLat: 0, maxLat: 1 };
  const areaDeg = polygonArea(normalized.length > 2 ? normalized : [
    { lng: bounds.minLng, lat: bounds.minLat },
    { lng: bounds.maxLng, lat: bounds.minLat },
    { lng: bounds.maxLng, lat: bounds.maxLat }
  ]);

  const latScale = 111320;
  const avgLat = ((bounds.minLat + bounds.maxLat) / 2) * (Math.PI / 180);
  const lngScale = Math.max(1, 111320 * Math.cos(avgLat));
  const widthM = Math.max(40, (bounds.maxLng - bounds.minLng || 0.001) * lngScale);
  const heightM = Math.max(40, (bounds.maxLat - bounds.minLat || 0.001) * latScale);
  const parcelAreaM2 = Math.max(1, areaDeg * lngScale * latScale);

  const profile = objectiveProfile(objective);
  const effectiveTargetSize = Math.max(120, Number(targetPlotSize || 500) * profile.plotMultiplier * (1 + variant * 0.03));
  const minFrontageM = Math.max(8, Number(minFrontage || 12));
  const roadSpacing = Math.max(40, Math.sqrt(effectiveTargetSize) * (profile.roadInterval + variant));
  const laneWidthM = Math.max(4, Number(roadWidth || 9));

  const verticalRoads = Math.max(0, Math.floor(widthM / roadSpacing) - 1);
  const horizontalRoads = Math.max(0, Math.floor(heightM / roadSpacing) - 1);

  const roadArea = (verticalRoads * heightM * laneWidthM) + (horizontalRoads * widthM * laneWidthM) - (verticalRoads * horizontalRoads * laneWidthM * laneWidthM);
  const usableArea = Math.max(0, parcelAreaM2 - roadArea);
  const rawPlotCount = Math.max(1, Math.floor(usableArea / effectiveTargetSize));

  const cols = Math.max(1, Math.ceil(Math.sqrt(rawPlotCount * (widthM / heightM))));
  const rows = Math.max(1, Math.ceil(rawPlotCount / cols));

  const roadBandX = verticalRoads * laneWidthM;
  const roadBandY = horizontalRoads * laneWidthM;
  const buildableWidth = Math.max(10, widthM - roadBandX);
  const buildableHeight = Math.max(10, heightM - roadBandY);
  const cellWidth = buildableWidth / cols;
  const cellHeight = buildableHeight / rows;

  const roadLines = [];
  for (let i = 1; i <= verticalRoads; i += 1) {
    const xM = (i * widthM) / (verticalRoads + 1);
    const lng = bounds.minLng + (xM / lngScale);
    roadLines.push([[lng, bounds.minLat], [lng, bounds.maxLat]]);
  }
  for (let i = 1; i <= horizontalRoads; i += 1) {
    const yM = (i * heightM) / (horizontalRoads + 1);
    const lat = bounds.minLat + (yM / latScale);
    roadLines.push([[bounds.minLng, lat], [bounds.maxLng, lat]]);
  }

  const plotGrid = [];
  const plotSizes = [];
  const frontages = [];

  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      if (plotGrid.length >= rawPlotCount) break;
      const x0 = bounds.minLng + ((c * cellWidth + Math.floor(c / Math.max(1, cols / Math.max(1, verticalRoads + 1))) * laneWidthM) / lngScale);
      const x1 = bounds.minLng + ((((c + 1) * cellWidth) + Math.floor((c + 1) / Math.max(1, cols / Math.max(1, verticalRoads + 1))) * laneWidthM) / lngScale);
      const y0 = bounds.minLat + ((r * cellHeight + Math.floor(r / Math.max(1, rows / Math.max(1, horizontalRoads + 1))) * laneWidthM) / latScale);
      const y1 = bounds.minLat + ((((r + 1) * cellHeight) + Math.floor((r + 1) / Math.max(1, rows / Math.max(1, horizontalRoads + 1))) * laneWidthM) / latScale);

      const frontage = Math.min(cellWidth, cellHeight);
      if (frontage < minFrontageM) continue;

      const size = cellWidth * cellHeight;
      if (size < 80) continue;

      const polygon = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
      plotGrid.push(polygon);
      plotSizes.push(size);
      frontages.push(frontage);
    }
  }

  const plots = plotGrid.length;
  const averagePlotSize = plots ? stable(plotSizes.reduce((acc, value) => acc + value, 0) / plots) : 0;
  const utilization = parcelAreaM2 ? usableArea / parcelAreaM2 : 0;
  const roadCoverage = parcelAreaM2 ? roadArea / parcelAreaM2 : 0;

  return {
    area: parcelAreaM2,
    bbox: bounds,
    plots,
    plotSizes,
    averagePlotSize,
    minLotArea: plots ? stable(Math.min(...plotSizes)) : 0,
    maxLotArea: plots ? stable(Math.max(...plotSizes)) : 0,
    frontageQuality: plots ? stable(frontages.reduce((a, v) => a + v, 0) / (plots * Math.max(minFrontageM, 1))) : 0,
    reserves: Math.max(0, Math.round(plots * 0.06)),
    roads: roadLines.length,
    roadArea,
    utilization,
    roadCoverage,
    roadNetwork: {
      pattern: roadLines.length ? 'deterministic-grid' : 'single-access',
      efficiency: stable(Math.max(0.4, Math.min(0.97, utilization - (roadCoverage * 0.35))))
    },
    roadLines,
    plotGrid,
    serialization: JSON.stringify({ plots, roadCount: roadLines.length, roadWidth: laneWidthM, targetPlotSize: effectiveTargetSize })
  };
}
