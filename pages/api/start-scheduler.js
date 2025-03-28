import { startScheduler } from '../../lib/scheduler';

let schedulerStarted = false;

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!schedulerStarted) {
      startScheduler();
      schedulerStarted = true;
      return res.status(200).json({ message: 'Scheduler started' });
    } else {
      return res.status(200).json({ message: 'Scheduler already running' });
    }
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return res.status(500).json({ error: 'Failed to start scheduler' });
  }
} 