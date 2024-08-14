import React from 'react';
import Head from 'next/head';
import Frame from '../components/Frame';
import fetchRSS from '../utils/fetchRSS';

export async function getServerSideProps() {
  console.log('Entering getServerSideProps');
  try {
    console.log('Attempting to fetch RSS data');
    const initialData = await fetchRSS('top');
    console.log('Fetched initial data:', JSON.stringify(initialData));
    return { props: { initialData } };
  } catch (error) {
    console.error('Detailed error in getServerSideProps:', error);
    console.error('Error stack:', error.stack);
    return { 
      props: { 
        error: {
          message: error.message || 'Failed to fetch initial data',
          stack: error.stack,
          details: JSON.stringify(error)
        } 
      } 
    };
  }
}

const Home = ({ initialData, error }) => {
  console.log('Rendering Home component');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  console.log('Base URL:', baseUrl);

  if (error) {
    console.error('Error in Home component:', error);
  }

  return (
    <div>
      <Head>
        <title>AP News Farcaster Frame</title>
        <meta property="og:title" content="AP News" />
        <meta property="og:image" content={`${baseUrl}/trending-news-placeholder.png`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${baseUrl}/trending-news-placeholder.png`} />
        <meta property="fc:frame:button:1" content="Next" />
        <meta property="fc:frame:button:2" content="Back" />
        <meta property="fc:frame:button:3" content="Read" />
        <meta property="fc:frame:button:4" content="Home" />
      </Head>
      {error ? (
        <div>
          <h1>Error</h1>
          <p>{error.message}</p>
          <details>
            <summary>Error Details</summary>
            <pre>{error.stack}</pre>
            <pre>{error.details}</pre>
          </details>
        </div>
      ) : (
        <Frame initialData={initialData} />
      )}
    </div>
  );
};

export default Home;