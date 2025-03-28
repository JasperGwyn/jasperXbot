// Next.js API route to test environment variables
export default function handler(req, res) {
  res.status(200).json({
    envVars: {
      X_API_KEY: process.env.X_API_KEY ? 'Set' : 'Not set',
      X_API_SECRET: process.env.X_API_SECRET ? 'Set' : 'Not set',
      X_ACCESS_TOKEN: process.env.X_ACCESS_TOKEN ? 'Set' : 'Not set',
      X_ACCESS_SECRET: process.env.X_ACCESS_SECRET ? 'Set' : 'Not set',
      X_COMMUNITY_ID: process.env.X_COMMUNITY_ID ? 'Set' : 'Not set',
      X_BEARER_TOKEN: process.env.X_BEARER_TOKEN ? 'Set' : 'Not set',
      X_CLIENT_ID: process.env.X_CLIENT_ID ? 'Set' : 'Not set',
      X_CLIENT_SECRET: process.env.X_CLIENT_SECRET ? 'Set' : 'Not set',
    }
  });
} 