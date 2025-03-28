import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# X (Twitter) API Configuration
X_CONFIG = {
    'api_key': os.getenv('X_API_KEY'),
    'api_secret': os.getenv('X_API_SECRET'),
    'bearer_token': os.getenv('X_BEARER_TOKEN'),
    'access_token': os.getenv('X_ACCESS_TOKEN'),
    'access_secret': os.getenv('X_ACCESS_SECRET'),
    'community_id': os.getenv('X_COMMUNITY_ID')
}

def validate_config():
    """Validate that all required environment variables are set."""
    required_vars = ['api_key', 'api_secret', 'bearer_token']
    missing_vars = [var for var in required_vars if not X_CONFIG[var]]
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return True 