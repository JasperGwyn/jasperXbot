import { readScheduledTweets } from '../../lib/scheduler';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tweets = readScheduledTweets();
    
    // Sort by scheduled time
    tweets.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    
    // Return the tweets
    return res.status(200).json({ tweets });
  } catch (error) {
    console.error('Error getting scheduled tweets:', error);
    return res.status(500).json({ error: 'Failed to get scheduled tweets' });
  }
} 