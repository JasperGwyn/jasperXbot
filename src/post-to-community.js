// Import the required modules
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// Initialize Twitter client with user context (needed for posting)
const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

// Tweet content about indie making with a call to action
const tweetContent = `Hi community! Starting my journey as an indie maker.

Building an app for async group meditation—helping people connect even when apart.

Anyone else building solo? Reply with your project. Let's support each other!`;

// Helper function to wait with countdown
function waitWithCountdown(minutes) {
  return new Promise((resolve) => {
    const totalSeconds = minutes * 60;
    let secondsRemaining = totalSeconds;
    
    console.log(`Waiting ${minutes} minutes before posting to respect rate limits...`);
    
    // Update every second
    const interval = setInterval(() => {
      secondsRemaining--;
      
      // Calculate minutes and seconds for display
      const displayMinutes = Math.floor(secondsRemaining / 60);
      const displaySeconds = secondsRemaining % 60;
      
      // Clear the current line and write the new countdown
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Posting in: ${displayMinutes}m ${displaySeconds}s`);
      
      if (secondsRemaining <= 0) {
        clearInterval(interval);
        process.stdout.write('\n'); // Move to the next line when done
        resolve();
      }
    }, 1000);
  });
}

// Function to post to a community
async function postToCommunity() {
  try {
    console.log('PREPARING COMMUNITY POST:');
    console.log('----------------------------');
    console.log(`Community ID: ${process.env.X_COMMUNITY_ID}`);
    console.log(tweetContent);
    console.log('----------------------------');
    
    // Check character count
    const charCount = tweetContent.length;
    console.log('Character count:', charCount);
    
    // Verify the tweet is within Twitter's character limit
    const TWITTER_CHAR_LIMIT = 280;
    if (charCount > TWITTER_CHAR_LIMIT) {
      console.error(`ERROR: Tweet exceeds ${TWITTER_CHAR_LIMIT} character limit by ${charCount - TWITTER_CHAR_LIMIT} characters.`);
      console.error('Please edit the tweet content to be shorter and try again.');
      return;
    }
    
    console.log(`Tweet is within the ${TWITTER_CHAR_LIMIT} character limit. Good to go!`);
    
    // Wait for 15 minutes with countdown
    await waitWithCountdown(15);
    
    console.log('\nPosting to community now...');
    
    // Get the community ID from environment variables
    const communityId = process.env.X_COMMUNITY_ID;
    
    // Create tweet with community parameter
    const response = await client.v2.tweet(tweetContent, {
      for_super_followers_only: false,
      reply: { exclude_reply_user_ids: [] },
      community_id: communityId
    });
    
    console.log('Tweet posted successfully to community!');
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`Tweet URL: https://twitter.com/user/status/${response.data.id}`);
    return response;
  } catch (error) {
    console.error('Error posting to community:', error);
    // Print more detailed error information
    if (error.data) {
      console.error('Error details:', JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

console.log('This script will post to your community after a 15-minute wait.');
console.log('This helps manage Twitter API rate limits in the free tier.');
console.log('To begin the process, uncomment the last line and run this script.');
console.log('You can press Ctrl+C at any time to cancel the post.');

// This line is commented out so it doesn't run automatically
// When you're ready, uncomment this line to post the tweet
postToCommunity(); 