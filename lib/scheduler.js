import { kv } from '@vercel/kv';
import cron from 'node-cron';
import { postToCommunity } from './twitter';

// Clave principal en Vercel KV para almacenar la lista de tweets
const KV_SCHEDULED_TWEETS_KEY = 'scheduledTweets';

// Función para leer scheduled tweets desde Vercel KV
export const readScheduledTweets = async () => {
  try {
    const tweets = await kv.lrange(KV_SCHEDULED_TWEETS_KEY, 0, -1);
    // Los datos de KV pueden necesitar ser parseados si los guardamos como strings JSON
    return tweets.map(tweet => typeof tweet === 'string' ? JSON.parse(tweet) : tweet);
  } catch (error) {
    console.error('Error reading scheduled tweets from KV:', error);
    return [];
  }
};

// Función para escribir/reemplazar la lista completa de tweets en Vercel KV
// Nota: KV funciona mejor con operaciones individuales, pero para simplificar empezamos así
export const writeScheduledTweets = async (tweets) => {
  try {
    // KV usa listas, vamos a eliminar la lista vieja y añadir los nuevos tweets
    await kv.del(KV_SCHEDULED_TWEETS_KEY);
    if (tweets.length > 0) {
      // Guardamos cada tweet como un string JSON en la lista
      const tweetStrings = tweets.map(tweet => JSON.stringify(tweet));
      await kv.rpush(KV_SCHEDULED_TWEETS_KEY, ...tweetStrings);
    }
    return true;
  } catch (error) {
    console.error('Error writing scheduled tweets to KV:', error);
    return false;
  }
};

// Función para AÑADIR un nuevo tweet programado a Vercel KV
export const addScheduledTweet = async (tweet) => {
  try {
    await kv.rpush(KV_SCHEDULED_TWEETS_KEY, JSON.stringify(tweet));
    return true;
  } catch (error) {
    console.error('Error adding scheduled tweet to KV:', error);
    return false;
  }
};

// Función para ACTUALIZAR un tweet específico (más eficiente)
// Necesitaremos una forma de encontrar y reemplazar un elemento en la lista KV
// Esto es más complejo con listas KV, podríamos cambiar a usar Hashes si es necesario
// Por ahora, mantenemos la lógica simple de leer todo, modificar y escribir todo.
export const updateTweetStatus = async (id, status, result = null) => {
  let tweets = await readScheduledTweets();
  const tweetIndex = tweets.findIndex(tweet => tweet.id === id);

  if (tweetIndex === -1) {
    console.warn(`Tweet with ID ${id} not found for status update.`);
    return false;
  }

  tweets[tweetIndex].status = status;
  if (result) {
    tweets[tweetIndex].result = result;
  }

  return await writeScheduledTweets(tweets);
};

// Function to post a scheduled tweet
export const postScheduledTweet = async (tweet) => {
  try {
    console.log(`Attempting to post scheduled tweet: ${tweet.id}`);
    
    // Update status to 'processing'
    await updateTweetStatus(tweet.id, 'processing');
    
    // *** Aquí llamamos a la función que publica en Twitter ***
    // Asegúrate que postToCommunity exista y funcione
    const postResult = await postToCommunity(tweet.message, tweet.communityId);
    
    if (postResult.success) {
      await updateTweetStatus(tweet.id, 'posted', { 
        tweetId: postResult.data?.id, // Ajusta según la respuesta real
        postedAt: new Date().toISOString() 
      });
      console.log(`Successfully posted tweet: ${tweet.id}`);
      return true;
    } else {
      await updateTweetStatus(tweet.id, 'failed', { 
        error: postResult.error || 'Unknown error', 
        details: postResult.details,
        failedAt: new Date().toISOString() 
      });
      console.error(`Failed to post tweet: ${tweet.id}`, postResult.error);
      return false;
    }
  } catch (error) {
    console.error(`Critical error posting scheduled tweet: ${tweet.id}`, error);
    await updateTweetStatus(tweet.id, 'failed', { 
      error: error.message, 
      failedAt: new Date().toISOString() 
    });
    return false;
  }
};

// Function to check for tweets that need to be posted (llamada por el cron)
export const checkScheduledTweets = async () => {
  console.log('[Scheduler] Checking for scheduled tweets...');
  const tweets = await readScheduledTweets();
  const now = new Date();
  let postedCount = 0;

  const tweetsToPost = tweets.filter(tweet => 
    tweet.status === 'scheduled' && new Date(tweet.scheduledTime) <= now
  );

  if (tweetsToPost.length === 0) {
    console.log('[Scheduler] No tweets due for posting.');
    return 0;
  }

  console.log(`[Scheduler] Found ${tweetsToPost.length} tweets to post.`);

  for (const tweet of tweetsToPost) {
    const success = await postScheduledTweet(tweet);
    if (success) {
      postedCount++;
    }
    // Pequeña pausa para no saturar la API de Twitter si hay muchos tweets juntos
    await new Promise(resolve => setTimeout(resolve, 500)); 
  }

  console.log(`[Scheduler] Finished check. Posted ${postedCount} tweets.`);
  return postedCount;
};

// *** ELIMINAMOS EL CRON LOCAL ***
// // Start the scheduler
// export const startScheduler = () => {
//   // Check for scheduled tweets every minute
//   cron.schedule('* * * * *', async () => {
//     await checkScheduledTweets();
//   });
//   
//   console.log('Tweet scheduler started');
// }; 