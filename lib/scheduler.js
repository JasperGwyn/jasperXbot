import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { postToCommunity } from './twitter';

// File to store scheduled tweets
const SCHEDULED_TWEETS_FILE = path.join(process.cwd(), 'scheduled-tweets.json');

// Backup storage for serverless environments like Vercel where filesystem isn't reliable
// This is a server-side global variable that persists between requests
// in the same serverless instance (but not across multiple instances)
global.scheduledTweetsBackup = global.scheduledTweetsBackup || [];

// Function to read scheduled tweets from file
export const readScheduledTweets = () => {
  console.log('Intentando leer tweets del archivo:', SCHEDULED_TWEETS_FILE);
  console.log('¿Existe el archivo?', fs.existsSync(SCHEDULED_TWEETS_FILE));
  
  // Check if we have tweets in the backup storage
  if (global.scheduledTweetsBackup && global.scheduledTweetsBackup.length > 0) {
    console.log('Usando tweets desde almacenamiento en memoria (backup):', global.scheduledTweetsBackup.length);
    return [...global.scheduledTweetsBackup]; // Return a copy to avoid direct mutations
  }
  
  if (!fs.existsSync(SCHEDULED_TWEETS_FILE)) {
    console.log('El archivo no existe, retornando array vacío');
    return [];
  }
  
  try {
    console.log('Leyendo contenido del archivo...');
    const fileContent = fs.readFileSync(SCHEDULED_TWEETS_FILE, 'utf8');
    console.log('Contenido leído, longitud:', fileContent.length);
    
    const parsedTweets = JSON.parse(fileContent);
    console.log('Tweets parseados correctamente:', parsedTweets.length);
    
    // Update the backup storage with the file contents
    global.scheduledTweetsBackup = [...parsedTweets];
    
    return parsedTweets;
  } catch (error) {
    console.error('Error al leer tweets programados:', error);
    console.error('Tipo de error:', error.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack trace:', error.stack);
    return [];
  }
};

// Function to write scheduled tweets to file
export const writeScheduledTweets = (tweets) => {
  // Always update the backup storage
  global.scheduledTweetsBackup = [...tweets];
  console.log('Tweets guardados en almacenamiento en memoria (backup):', global.scheduledTweetsBackup.length);
  
  try {
    console.log('Intentando escribir', tweets.length, 'tweets en el archivo:', SCHEDULED_TWEETS_FILE);
    const jsonContent = JSON.stringify(tweets, null, 2);
    console.log('JSON generado, longitud:', jsonContent.length);
    
    fs.writeFileSync(SCHEDULED_TWEETS_FILE, jsonContent, 'utf8');
    console.log('Tweets escritos exitosamente en el archivo');
    return true;
  } catch (error) {
    console.error('Error al escribir tweets programados:', error);
    console.error('Tipo de error:', error.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Even if file write fails, we still have the backup
    console.log('Archivo falló, pero los tweets están guardados en memoria');
    return global.scheduledTweetsBackup.length > 0; // Return true if backup was successful
  }
};

// Function to update a scheduled tweet's status
export const updateTweetStatus = (id, status, result = null) => {
  const tweets = readScheduledTweets();
  
  const tweetIndex = tweets.findIndex(tweet => tweet.id === id);
  
  if (tweetIndex === -1) {
    return false;
  }
  
  tweets[tweetIndex].status = status;
  
  if (result) {
    tweets[tweetIndex].result = result;
  }
  
  return writeScheduledTweets(tweets);
};

// Function to post a scheduled tweet
export const postScheduledTweet = async (tweet) => {
  try {
    console.log(`Posting scheduled tweet: ${tweet.id}`);
    
    // Update status to 'processing'
    updateTweetStatus(tweet.id, 'processing');
    
    // Post to Twitter
    const result = await postToCommunity(tweet.message, tweet.communityId);
    
    if (result.success) {
      // Update status to 'posted'
      updateTweetStatus(tweet.id, 'posted', {
        tweetId: result.data.id,
        postedAt: new Date().toISOString()
      });
      
      console.log(`Successfully posted tweet: ${tweet.id}`);
      return true;
    } else {
      // Update status to 'failed'
      updateTweetStatus(tweet.id, 'failed', {
        error: result.error,
        details: result.details,
        failedAt: new Date().toISOString()
      });
      
      console.error(`Failed to post tweet: ${tweet.id}`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`Error posting scheduled tweet: ${tweet.id}`, error);
    
    // Update status to 'failed'
    updateTweetStatus(tweet.id, 'failed', {
      error: error.message,
      failedAt: new Date().toISOString()
    });
    
    return false;
  }
};

// Function to check for tweets that need to be posted
export const checkScheduledTweets = async () => {
  console.log('Checking for scheduled tweets...');
  
  const tweets = readScheduledTweets();
  const now = new Date();
  
  let postedCount = 0;
  
  for (const tweet of tweets) {
    // Skip tweets that are not in 'scheduled' status
    if (tweet.status !== 'scheduled') {
      continue;
    }
    
    const scheduledTime = new Date(tweet.scheduledTime);
    
    // If it's time to post the tweet (scheduled time is in the past)
    if (scheduledTime <= now) {
      const success = await postScheduledTweet(tweet);
      
      if (success) {
        postedCount++;
      }
    }
  }
  
  if (postedCount > 0) {
    console.log(`Posted ${postedCount} scheduled tweets`);
  } else {
    console.log('No tweets to post at this time');
  }
  
  return postedCount;
};

// Start the scheduler
export const startScheduler = () => {
  // Check for scheduled tweets every minute
  cron.schedule('* * * * *', async () => {
    await checkScheduledTweets();
  });
  
  console.log('Tweet scheduler started');
}; 