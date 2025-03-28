import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { postToCommunity } from './twitter';

// File to store scheduled tweets
const SCHEDULED_TWEETS_FILE = path.join(process.cwd(), 'scheduled-tweets.json');

// Function to read scheduled tweets from file
export const readScheduledTweets = () => {
  if (!fs.existsSync(SCHEDULED_TWEETS_FILE)) {
    return [];
  }
  
  try {
    const fileContent = fs.readFileSync(SCHEDULED_TWEETS_FILE, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading scheduled tweets:', error);
    return [];
  }
};

// Function to write scheduled tweets to file
export const writeScheduledTweets = (tweets) => {
  try {
    fs.writeFileSync(SCHEDULED_TWEETS_FILE, JSON.stringify(tweets, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing scheduled tweets:', error);
    return false;
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