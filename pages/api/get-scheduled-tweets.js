import { readScheduledTweets } from '../../lib/scheduler';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API: Intentando leer tweets programados');
    
    // Leer del archivo JSON
    const tweets = readScheduledTweets();
    console.log(`API: Tweets leídos del archivo: ${tweets.length}`, JSON.stringify(tweets));
    
    // Sort by scheduled time
    tweets.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    
    // Return the tweets
    console.log(`API: Enviando ${tweets.length} tweets al cliente`);
    return res.status(200).json({ tweets });
  } catch (error) {
    console.error('Error getting scheduled tweets:', error);
    return res.status(500).json({ error: 'Failed to get scheduled tweets' });
  }
} 