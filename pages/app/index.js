import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AppIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, []);
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Redirecting...</h1>
      <p>Please wait while we redirect you to the main application.</p>
    </div>
  );
}
 