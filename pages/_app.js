import '../styles/globals.css';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Log helpful information for debugging
      console.log('App loaded at:', window.location.href);
      console.log('Pathname:', window.location.pathname);
      console.log('Hostname:', window.location.hostname);
    } catch (err) {
      console.error('Error in _app.js:', err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p>Error: {error}</p>
        <p><a href="/">Return to home page</a></p>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp; 