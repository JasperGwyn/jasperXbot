export default function handler(req, res) {
  // Get the request host/origin info
  const host = req.headers.host || 'unknown';
  const origin = req.headers.origin || 'unknown';

  res.status(200).json({ 
    status: 'ok', 
    message: 'API is working properly',
    timestamp: new Date().toISOString(),
    request: {
      host,
      origin,
      path: req.url,
      method: req.method
    }
  });
} 