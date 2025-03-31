import { checkScheduledTweets } from '../../lib/scheduler';

// Clave secreta para proteger el endpoint
// Guárdala como una variable de entorno en Vercel: CRON_SECRET
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  // 1. Verificar Método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Verificar Secreto de Autorización
  const authorization = req.headers.authorization;
  if (!authorization || authorization !== `Bearer ${CRON_SECRET}`) {
    console.warn('Intento de acceso no autorizado al cron endpoint');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Ejecutar la lógica de revisión de tweets
  try {
    console.log('Cron job triggered via API endpoint');
    const postedCount = await checkScheduledTweets();
    return res.status(200).json({ 
      status: 'ok', 
      message: `Checked scheduled tweets. Posted ${postedCount}.` 
    });
  } catch (error) {
    console.error('Error executing cron job via API:', error);
    return res.status(500).json({ error: 'Cron job execution failed' });
  }
} 