import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Log helpful information for debugging
    console.log('App loaded at:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Hostname:', window.location.hostname);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp; 