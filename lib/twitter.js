import { TwitterApi } from 'twitter-api-v2';

// Initialize Twitter client with user context (needed for posting)
export const getTwitterClient = () => {
  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });
};

// Post a tweet to community
export const postToCommunity = async (message, communityId) => {
  try {
    const client = getTwitterClient();
    
    // Create tweet with community parameter
    const response = await client.v2.tweet(message, {
      for_super_followers_only: false,
      reply: { exclude_reply_user_ids: [] },
      community_id: communityId
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error posting to community:', error);
    
    return {
      success: false,
      error: error.message,
      details: error.data || {}
    };
  }
}; 