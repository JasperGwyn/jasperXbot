import fs from 'fs';
import path from 'path';
import { TwitterApi } from 'twitter-api-v2';

// File to store scheduled tweets (note: this won't persist in Vercel)
const SCHEDULED_TWEETS_FILE = path.join(process.cwd(), 'scheduled-tweets.json');

// Function to read scheduled tweets from file
const readScheduledTweets = () => {
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
const writeScheduledTweets = (tweets) => {
  try {
    fs.writeFileSync(SCHEDULED_TWEETS_FILE, JSON.stringify(tweets, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing scheduled tweets:', error);
    return false;
  }
};

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
      scheduledTime,
      status: 'scheduled',
      communityId: process.env.X_COMMUNITY_ID,
      createdAt: new Date().toISOString()
    };
    
    // Read existing scheduled tweets
    const scheduledTweets = readScheduledTweets();
    
    // Add new scheduled tweet
    scheduledTweets.push(scheduledTweet);
    
    // Save to file (note: this won't persist in Vercel)
    const saved = writeScheduledTweets(scheduledTweets);
    
    if (!saved) {
      console.warn('Failed to save scheduled tweet to file - this is expected in Vercel');
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tweet scheduled successfully',
      tweet: scheduledTweet // Return the full tweet object so client can store it
    });
    
  } catch (error) {
    console.error('Error scheduling tweet:', error);
    return res.status(500).json({ error: 'Failed to schedule tweet' });
  }
} 