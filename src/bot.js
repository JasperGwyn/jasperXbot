require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// Initialize Twitter client with user context
const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

// Initialize Twitter client with Bearer Token for app-only access
const appClient = new TwitterApi(process.env.X_BEARER_TOKEN);

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle rate limits with retries
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429) {
        const resetTime = error.rateLimit?.reset;
        const waitTime = resetTime ? (resetTime * 1000 - Date.now()) : Math.pow(2, i) * 1000;
        console.log(`Rate limit reached. Waiting ${waitTime/1000} seconds before retry...`);
        await wait(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

// Function to get community posts
async function getCommunityPosts() {
  try {
    return await withRetry(async () => {
      // Get community ID from env
      const communityId = process.env.X_COMMUNITY_ID;
      
      // Use simple search for tweets mentioning the community ID
      // Note: This endpoint has strict limits in free tier (1 request per 15 minutes)
      const query = communityId;
      
      console.log(`Searching for posts related to community ID: ${communityId}`);
      console.log('Note: Free tier only allows 1 search request per 15 minutes');
      
      const tweets = await appClient.v2.search(query, {
        'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'in_reply_to_user_id'],
        'expansions': ['author_id', 'referenced_tweets.id'],
        'user.fields': ['username', 'name', 'profile_image_url'],
        'max_results': 10  // Twitter API requires between 10 and 100
      });
      
      // Get full response data
      const result = tweets?.data || [];
      const includes = tweets?.includes || {};
      const meta = tweets?.meta || {};

      console.log(`Found ${result.length} posts related to the community ID`);
      
      if (result.length === 0) {
        console.log('No posts found. This could be due to:');
        console.log('1. No recent posts with this community ID');
        console.log('2. Rate limits (free tier: 1 request per 15 minutes)');
        console.log('3. The community ID might not be searchable this way');
      }

      // Add user information to tweets
      return result.map(tweet => {
        const author = includes.users?.find(user => user.id === tweet.author_id);
        return {
          ...tweet,
          author: author || null
        };
      });
    });
  } catch (error) {
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset;
      const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleString() : 'unknown time';
      console.error(`Rate limit reached. Will reset at: ${resetDate}`);
      console.error('Free tier Twitter API is limited to 1 request per 15 minutes for most endpoints');
    } else {
      console.error('Error fetching community posts:', error);
    }
    return [];
  }
}

// Function to post a reply
async function postReply(tweetId, replyText) {
  try {
    return await withRetry(async () => {
      const reply = await client.v2.reply(
        replyText,
        tweetId
      );
      console.log('Reply posted successfully:', reply);
      return reply;
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
}

// Function to post a new tweet
async function postTweet(text) {
  try {
    return await withRetry(async () => {
      const tweet = await client.v2.tweet(text);
      console.log('Tweet posted successfully:', tweet);
      return tweet;
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
}

// Function to get user's timeline
async function getUserTimeline(userId) {
  try {
    return await withRetry(async () => {
      const tweets = await appClient.v2.userTimeline(userId, {
        'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'in_reply_to_user_id'],
        'expansions': ['author_id', 'referenced_tweets.id'],
        'user.fields': ['username', 'name', 'profile_image_url'],
        'max_results': 100
      });

      // Get full response data
      const result = tweets.data || [];
      const includes = tweets.includes || {};
      
      // Add user information to tweets
      return result.map(tweet => {
        const author = includes.users?.find(user => user.id === tweet.author_id);
        return {
          ...tweet,
          author: author || null
        };
      });
    });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    return [];
  }
}

// Main function to run the bot
async function runBot() {
  try {
    // Get community posts using Bearer Token
    const posts = await getCommunityPosts();
    console.log('Community posts:', posts);

    if (posts.length > 0) {
      // Wait between requests to avoid rate limits
      await wait(2000);

      // Example: Post a new tweet using user context
      await postTweet('Hello community! 👋');

      // Wait between requests to avoid rate limits
      await wait(2000);

      // Example: Reply to the most recent post using user context
      await postReply(posts[0].id, 'Thanks for sharing! 🙌');
    }
  } catch (error) {
    console.error('Error running bot:', error);
  }
}

// Export functions for use in other files
module.exports = {
  getCommunityPosts,
  postReply,
  postTweet,
  getUserTimeline,
  runBot
}; 