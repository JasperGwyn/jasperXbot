const { runBot } = require('../src/bot');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runBot();
    res.status(200).json({ message: 'Bot executed successfully' });
  } catch (error) {
    console.error('Error in bot execution:', error);
    res.status(500).json({ message: 'Error executing bot', error: error.message });
  }
} 