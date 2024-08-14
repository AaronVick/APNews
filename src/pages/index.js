import React from 'react';
import Head from 'next/head';
import Frame from '../components/Frame';
import fetchRSS from '../utils/fetchRSS';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export async function getServerSideProps() {
  console.log('Entering getServerSideProps');
  try {
    console.log('Attempting to fetch RSS data');
    const initialData = await fetchRSS('top');
    console.log('Fetched initial data:', JSON.stringify(initialData));
    return { props: { initialData } };
  } catch (error) {
    console.error('Detailed error in getServerSideProps:', error);
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

  const defaultImage = `${baseUrl}/trending-news-placeholder.png`;
  const currentImage = initialData && initialData[0] ? initialData[0].imageUrl : defaultImage;

  return (
    <ErrorBoundary fallback={
      <div>
        <Head>
          <title>AP News Farcaster Frame - Error</title>
          <meta property="og:title" content="AP News - Error" />
          <meta property="og:image" content={defaultImage} />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content={defaultImage} />
          <meta property="fc:frame:button:1" content="Retry" />
        </Head>
        <h1>Error occurred</h1>
        <img src={defaultImage} alt="Error" style={{ width: '100%', height: 'auto' }} />
      </div>
    }>
      <div>
        <Head>
          <title>AP News Farcaster Frame</title>
          <meta property="og:title" content="AP News" />
          <meta property="og:image" content={currentImage} />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content={currentImage} />
          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:2" content="Back" />
          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:4" content="Home" />
        </Head>
        {error ? (
          <div>
            <h1>Error</h1>
            <p>{error.message}</p>
            <img src={defaultImage} alt="Error" style={{ width: '100%', height: 'auto' }} />
          </div>
        ) : (
          <Frame initialData={initialData} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Home;