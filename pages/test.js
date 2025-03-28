import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TestPage() {
  const [info, setInfo] = useState({
    url: '',
    pathname: '',
    hostname: '',
    time: ''
  });

  useEffect(() => {
    setInfo({
      url: window.location.href,
      pathname: window.location.pathname,
      hostname: window.location.hostname,
      time: new Date().toISOString()
    });
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>Test Page | Twitter Community Scheduler</title>
      </Head>

      <h1>Test Page - Twitter Community Scheduler</h1>
      
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '4px', margin: '20px 0' }}>
        <h2>Debug Information</h2>
        <p><strong>Current URL:</strong> {info.url}</p>
        <p><strong>Pathname:</strong> {info.pathname}</p>
        <p><strong>Hostname:</strong> {info.hostname}</p>
        <p><strong>Time:</strong> {info.time}</p>
      </div>
      
      <h2>Navigation Links</h2>
      <ul>
        <li><Link href="/">Home Page</Link></li>
        <li><Link href="/app">App Page (should redirect to home)</Link></li>
        <li><Link href="/api/health">API Health Check</Link></li>
      </ul>
    </div>
  );
} 