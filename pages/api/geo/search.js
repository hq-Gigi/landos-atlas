export default async function handler(req, res) {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
      headers: { 'User-Agent': 'LandOS-Atlas/1.0' }
    });
    if (!response.ok) return res.status(502).json({ error: 'search_failed' });
    const data = await response.json();
    return res.status(200).json(data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      bbox: item.boundingbox
    })));
  } catch (error) {
    return res.status(500).json({ error: 'search_unavailable' });
  }
}
