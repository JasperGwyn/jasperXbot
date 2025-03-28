import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AppIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Simple redirect to root
    if (router.isReady) {
      router.push('/');
    }
  }, [router.isReady]);
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Head>
        <title>Redirecting... | Twitter Community Scheduler</title>
      </Head>
      <h1>Redirecting...</h1>
      <p>Please wait while we redirect you to the main application.</p>
      <p>If you are not redirected automatically, <a href="/">click here</a> to go to the home page.</p>
    </div>
  );
}
 