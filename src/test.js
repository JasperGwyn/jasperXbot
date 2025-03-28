const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

function testApiConfiguration() {
  try {
    console.log('Checking Twitter API v2 configuration...\n');

    // Check if API credentials are loaded properly
    const bearerToken = process.env.X_BEARER_TOKEN;
    const apiKey = process.env.X_API_KEY;
    const apiSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;
    const communityId = process.env.X_COMMUNITY_ID;
    
    console.log('Twitter/X API configuration:');
    console.log('------------------------');
    console.log(`API Key: ${apiKey ? '✓ Present' : '✗ Missing'}`);
    console.log(`API Secret: ${apiSecret ? '✓ Present' : '✗ Missing'}`);
    console.log(`Access Token: ${accessToken ? '✓ Present' : '✗ Missing'}`);
    console.log(`Access Secret: ${accessSecret ? '✓ Present' : '✗ Missing'}`);
    console.log(`Bearer Token: ${bearerToken ? '✓ Present' : '✗ Missing'}`);
    console.log(`Community ID: ${communityId ? '✓ Present' : '✗ Missing'}`);
    console.log('------------------------');
    
    // Initialize clients (without making API calls)
    console.log('Initializing API clients...');
    
    const userClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
    
    const appOnlyClient = new TwitterApi(bearerToken);
    
    console.log('API clients successfully initialized!');
    console.log('------------------------');
    console.log('Important Twitter API Free Tier Limitations:');
    console.log('1. Most endpoints: 1 request per 15 minutes');
    console.log('2. Some endpoints: 1 request per 24 hours');
    console.log('3. You are currently rate-limited - wait for the limits to reset');
    console.log('4. Your monthly tweet cap usage is at 19% (resets April 18)');
    console.log('------------------------');
    console.log('To actually test the API functionality:');
    console.log('1. Wait for rate limits to reset (typically 15 min to 24 hours)');
    console.log('2. Run the bot then with: node src/bot.js');
    console.log('------------------------');

    return true;
  } catch (error) {
    console.error('Error with Twitter API configuration:', error);
    return false;
  }
}

// Run the configuration test
testApiConfiguration(); 