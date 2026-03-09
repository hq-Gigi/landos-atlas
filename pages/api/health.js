export default function handler(_req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'landos-atlas',
    timestamp: new Date().toISOString(),
  });
}
