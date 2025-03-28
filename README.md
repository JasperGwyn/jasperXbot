# Twitter Community Post Scheduler

A Next.js application for scheduling posts to Twitter communities.

## Features

- Schedule tweets to be posted at a specific date and time
- Character count checker to ensure tweets don't exceed 280 characters
- View and manage scheduled tweets
- Scheduler runs in the background to post tweets at their scheduled time

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your Twitter API credentials:

```
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_SECRET=your_access_secret_here
X_COMMUNITY_ID=your_community_id_here
```

**Important**: Make sure your Twitter API app has **write permissions** to post tweets.

3. Run the development server:

```bash
npm run dev
```

## How It Works

1. The app allows you to write a tweet and select a future date and time
2. Scheduled tweets are stored in a JSON file (`scheduled-tweets.json`)
3. When you start the scheduler, it checks for due tweets every minute
4. When a tweet's scheduled time arrives, the scheduler posts it to Twitter

## Rate Limits

Note that Twitter's free tier API has strict rate limits:
- 17 tweets per 24 hours
- Various endpoints limited to 1 request per 15 minutes

## Deployment

To build the app for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
``` 