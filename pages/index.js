import { useState, useEffect } from 'react';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from 'date-fns';

export default function Home() {
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [charCount, setCharCount] = useState(0);
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledTweets, setScheduledTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schedulerStarted, setSchedulerStarted] = useState(false);
  const [isStartingScheduler, setIsStartingScheduler] = useState(false);
  const MAX_CHARS = 280;

  // Update character count when message changes
  useEffect(() => {
    setCharCount(message.length);
  }, [message]);
  
  // Fetch scheduled tweets
  const fetchScheduledTweets = async () => {
    // Skip if not in browser
    if (typeof window === 'undefined') return;
    
    console.log('Cliente: Iniciando obtención de tweets programados');
    setIsLoading(true);
    try {
      // Try to get tweets from localStorage first
      const localTweets = localStorage.getItem('scheduledTweets');
      if (localTweets) {
        const parsedLocalTweets = JSON.parse(localTweets) || [];
        console.log('Cliente: Tweets leídos de localStorage:', parsedLocalTweets.length);
        setScheduledTweets(parsedLocalTweets);
      } else {
        console.log('Cliente: No hay tweets en localStorage');
      }
      
      // Then fetch from API to keep in sync with server
      console.log('Cliente: Solicitando tweets del servidor...');
      const response = await fetch('/api/get-scheduled-tweets');
      const data = await response.json();
      console.log('Cliente: Respuesta del servidor:', data);
      
      // Merge local tweets with server tweets
      if (data.tweets && data.tweets.length > 0) {
        console.log('Cliente: El servidor devolvió', data.tweets.length, 'tweets');
        const mergedTweets = [...(JSON.parse(localTweets) || [])];
        
        // Add any tweets from the server that aren't in local storage
        data.tweets.forEach(serverTweet => {
          if (!mergedTweets.some(localTweet => localTweet.id === serverTweet.id)) {
            mergedTweets.push(serverTweet);
          }
        });
        
        console.log('Cliente: Tweets combinados después de la fusión:', mergedTweets.length);
        setScheduledTweets(mergedTweets);
        localStorage.setItem('scheduledTweets', JSON.stringify(mergedTweets));
      } else {
        console.log('Cliente: El servidor no devolvió tweets');
      }
    } catch (error) {
      console.error('Error fetching scheduled tweets:', error);
      
      // Fallback to localStorage if API fails
      const localTweets = localStorage.getItem('scheduledTweets');
      if (localTweets) {
        const parsedLocalTweets = JSON.parse(localTweets) || [];
        console.log('Cliente: Fallback a localStorage después de error:', parsedLocalTweets.length, 'tweets');
        setScheduledTweets(parsedLocalTweets);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch scheduled tweets on page load
  useEffect(() => {
    // Initialize localStorage safely (only in browser)
    if (typeof window !== 'undefined') {
      fetchScheduledTweets();
    }
  }, []);

  // Start the scheduler
  const startScheduler = async () => {
    setIsStartingScheduler(true);
    try {
      const response = await fetch('/api/start-scheduler', {
        method: 'POST',
      });
      const data = await response.json();
      setSchedulerStarted(true);
    } catch (error) {
      console.error('Error starting scheduler:', error);
    } finally {
      setIsStartingScheduler(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (message.trim() === '') {
      setScheduleStatus('Error: Message cannot be empty');
      return;
    }
    
    if (charCount > MAX_CHARS) {
      setScheduleStatus(`Error: Message exceeds ${MAX_CHARS} characters`);
      return;
    }
    
    if (scheduledDate < new Date()) {
      setScheduleStatus('Error: Scheduled time must be in the future');
      return;
    }
    
    setIsSubmitting(true);
    setScheduleStatus('Scheduling...');
    
    try {
      const response = await fetch('/api/schedule-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          scheduledTime: scheduledDate.toISOString(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScheduleStatus(`Success! Tweet scheduled for ${format(scheduledDate, 'PPpp')}`);
        setMessage('');
        setScheduledDate(new Date());
        
        // Store in localStorage
        if (data.tweet) {
          const localTweets = localStorage.getItem('scheduledTweets');
          const tweets = localTweets ? JSON.parse(localTweets) : [];
          tweets.push(data.tweet);
          localStorage.setItem('scheduledTweets', JSON.stringify(tweets));
        }
        
        // Refresh the list of scheduled tweets
        fetchScheduledTweets();
      } else {
        setScheduleStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setScheduleStatus(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Twitter Community Scheduler</title>
        <meta name="description" content="Schedule posts to your Twitter community" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Twitter Community Post Scheduler</h1>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              disabled={isSubmitting}
            />
            <div className={`charCounter ${charCount > MAX_CHARS ? 'error' : ''}`}>
              {charCount}/{MAX_CHARS} characters
            </div>
          </div>
          
          <div className="formGroup">
            <label htmlFor="scheduledDate">Schedule for:</label>
            <DatePicker
              id="scheduledDate"
              selected={scheduledDate}
              onChange={setScheduledDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              disabled={isSubmitting}
              className="datePicker"
            />
          </div>
          
          <button type="submit" disabled={isSubmitting || charCount > MAX_CHARS}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Tweet'}
          </button>
          
          {scheduleStatus && (
            <div className={`status ${scheduleStatus.includes('Error') ? 'error' : scheduleStatus.includes('Success') ? 'success' : ''}`}>
              {scheduleStatus}
            </div>
          )}
        </form>
        
        <div className="info">
          <div className="headerRow">
            <h2>Scheduled Tweets</h2>
            <button 
              onClick={startScheduler} 
              disabled={isStartingScheduler || schedulerStarted}
              className="startButton"
            >
              {isStartingScheduler ? 'Starting...' : schedulerStarted ? 'Scheduler Running' : 'Start Scheduler'}
            </button>
          </div>
          
          {isLoading ? (
            <p>Loading scheduled tweets...</p>
          ) : scheduledTweets.length === 0 ? (
            <p>No scheduled tweets yet.</p>
          ) : (
            <div className="tweetList">
              {scheduledTweets.map((tweet) => (
                <div key={tweet.id} className={`tweetItem ${tweet.status}`}>
                  <div className="tweetHeader">
                    <span className="tweetTime">
                      {format(parseISO(tweet.scheduledTime), 'PPpp')}
                    </span>
                    <span className={`tweetStatus ${tweet.status}`}>
                      {tweet.status.charAt(0).toUpperCase() + tweet.status.slice(1)}
                    </span>
                  </div>
                  <div className="tweetContent">{tweet.message}</div>
                  {tweet.result && tweet.result.tweetId && (
                    <div className="tweetResult">
                      Posted at: {format(parseISO(tweet.result.postedAt), 'PPpp')}
                      <a 
                        href={`https://twitter.com/user/status/${tweet.result.tweetId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tweetLink"
                      >
                        View on Twitter
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="refreshButton">
            <button onClick={fetchScheduledTweets} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        h1 {
          margin: 0 0 2rem 0;
          line-height: 1.15;
          font-size: 2rem;
          text-align: center;
        }

        .form {
          width: 100%;
          max-width: 600px;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          margin-bottom: 2rem;
        }

        .formGroup {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          resize: vertical;
        }

        .datePicker {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          width: 100%;
        }

        button {
          background-color: #1da1f2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover {
          background-color: #0d8ecf;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .charCounter {
          margin-top: 0.5rem;
          text-align: right;
          font-size: 0.9rem;
          color: #666;
        }

        .charCounter.error {
          color: #e0245e;
          font-weight: bold;
        }

        .status {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 5px;
          text-align: center;
        }

        .status.error {
          background-color: #ffebee;
          color: #e0245e;
        }

        .status.success {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .info {
          width: 100%;
          max-width: 600px;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: #fff;
        }

        .headerRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .startButton {
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
        }

        .refreshButton {
          margin-top: 1rem;
          text-align: center;
        }

        .tweetList {
          margin-top: 1rem;
        }

        .tweetItem {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 1rem;
        }

        .tweetItem.scheduled {
          border-left: 4px solid #1da1f2;
        }

        .tweetItem.processing {
          border-left: 4px solid #f2a91d;
        }

        .tweetItem.posted {
          border-left: 4px solid #2e7d32;
        }

        .tweetItem.failed {
          border-left: 4px solid #e0245e;
        }

        .tweetHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .tweetTime {
          color: #666;
        }

        .tweetStatus {
          font-weight: bold;
        }

        .tweetStatus.scheduled {
          color: #1da1f2;
        }

        .tweetStatus.processing {
          color: #f2a91d;
        }

        .tweetStatus.posted {
          color: #2e7d32;
        }

        .tweetStatus.failed {
          color: #e0245e;
        }

        .tweetContent {
          margin-bottom: 0.5rem;
          white-space: pre-wrap;
        }

        .tweetResult {
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.5rem;
          display: flex;
          justify-content: space-between;
        }

        .tweetLink {
          color: #1da1f2;
          text-decoration: none;
        }

        .tweetLink:hover {
          text-decoration: underline;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          background-color: #f8f9fa;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
} 