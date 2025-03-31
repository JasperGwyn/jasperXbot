import { addScheduledTweet } from '../../lib/scheduler'; // Importar la nueva función

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, scheduledTime } = req.body;
    
    // Validate inputs
    if (!message || !scheduledTime) {
      return res.status(400).json({ error: 'Message and scheduled time are required' });
    }
    
    if (message.length > 280) {
      return res.status(400).json({ error: 'Message exceeds 280 characters' });
    }
    
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      return res.status(400).json({ error: 'Invalid scheduled time' });
    }
    
    // Generate a unique ID for this scheduled tweet
    const id = `tweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create scheduled tweet object
    const scheduledTweet = {
      id,
      message,
      scheduledTime: scheduledDate.toISOString(), // Asegurar formato ISO
      status: 'scheduled',
      communityId: process.env.X_COMMUNITY_ID,
      createdAt: new Date().toISOString()
    };
    
    // Guardar usando la nueva función para Vercel KV
    const saved = await addScheduledTweet(scheduledTweet);
    
    if (!saved) {
      // KV devolverá false si hay error, registrarlo
      console.error('Failed to save scheduled tweet to Vercel KV');
      return res.status(500).json({ error: 'Failed to save scheduled tweet' });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tweet scheduled successfully',
      tweet: scheduledTweet // Devolver el objeto para el cliente
    });
    
  } catch (error) {
    console.error('Error scheduling tweet:', error);
    return res.status(500).json({ error: 'Failed to schedule tweet' });
  }
} 