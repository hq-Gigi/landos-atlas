export function validatePolygon(points) {
  return Array.isArray(points) && points.length >= 3 && points.every((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng));
}

export function normalizeAssumptions(input = {}) {
  return {
    constructionCostPerUnit: Number(input.constructionCostPerUnit || 55000),
    salePricePerUnit: Number(input.salePricePerUnit || 90000),
    timelineBaseMonths: Number(input.timelineBaseMonths || 14)
  };
}

export function validateAuthPayload({ email, password }) {
  if (!email || !password) return 'email and password required';
  if (!String(email).includes('@')) return 'invalid email';
  if (String(password).length < 8) return 'password must be at least 8 characters';
  return null;
}
