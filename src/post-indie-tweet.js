// Import the postTweet function from bot.js
const { postTweet } = require('./bot');

// Tweet content about indie making with a call to action
const tweetContent = `Just started my journey as an indie maker & solopreneur!

Building products that solve real problems is my goal. Learning, failing, and growing in public.

Are you also building solo? Let's connect and support each other! Reply with what you're working on.`;

// Function to post the tweet
async function postIndieMakerTweet() {
  try {
    console.log('Posting indie maker tweet...');
    console.log('----------------------------');
    console.log(tweetContent);
    console.log('----------------------------');
    
    // This will only run when you're ready
    const response = await postTweet(tweetContent);
    
    console.log('Tweet posted successfully!');
    console.log(`Tweet ID: ${response.data.id}`);
    console.log(`Tweet URL: https://twitter.com/user/status/${response.data.id}`);
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
}

// Display tweet preview
console.log('TWEET PREVIEW:');
console.log('----------------------------');
console.log(tweetContent);
console.log('----------------------------');
console.log('Character count:', tweetContent.length);
console.log('\nThis tweet is ready but NOT posted yet.');
console.log('When you\'re ready to post:');
console.log('1. Uncomment the last line in this file');
console.log('2. Run with: node src/post-indie-tweet.js');

// This line is commented out so it doesn't run automatically
// When you're ready, uncomment this line to post the tweet
postIndieMakerTweet(); 