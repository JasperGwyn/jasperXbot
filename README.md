# Twitter Community Bot

A Twitter bot that interacts with a specific community, reading posts and responding to them.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Twitter API credentials:
   ```
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_ACCESS_TOKEN=your_access_token_here
   TWITTER_ACCESS_SECRET=your_access_secret_here
   COMMUNITY_ID=1493446837214187523
   ```

## Local Development

To run the bot locally:
```bash
node src/bot.js
```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Set up environment variables in your Vercel project settings

4. Set up a cron job or use a service like cron-job.org to trigger the bot endpoint periodically:
   ```
   POST https://your-vercel-domain.vercel.app/api/bot
   ```

## Features

- Read posts from a specific Twitter community
- Post new tweets
- Reply to community posts
- Automated execution via API endpoint

## Note

This bot uses Twitter API v2. Make sure you have the appropriate API access level and permissions for your Twitter Developer account. 