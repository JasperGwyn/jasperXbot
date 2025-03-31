import { readScheduledTweets } from '../../lib/scheduler';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Leer desde Vercel KV usando la función actualizada
    const tweets = await readScheduledTweets();
    
    // Ordenar por hora programada (opcional, pero útil para el cliente)
    tweets.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    
    return res.status(200).json({ tweets });
  } catch (error) {
    console.error('Error getting scheduled tweets:', error);
    return res.status(500).json({ error: 'Failed to get scheduled tweets' });
  }
} 