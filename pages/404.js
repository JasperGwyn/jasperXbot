import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="container">
      <Head>
        <title>404 - Page Not Found | Twitter Community Scheduler</title>
        <meta name="description" content="404 - Page not found" />
      </Head>

      <main style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <p>
          <Link href="/" style={{ color: '#1DA1F2', textDecoration: 'underline' }}>
            Go back to the home page
          </Link>
        </p>
      </main>
    </div>
  );
} 