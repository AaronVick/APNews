import React from 'react';
import Head from 'next/head';
import Frame from '../components/Frame';
import fetchRSS from '../utils/fetchRSS';

export async function getServerSideProps() {
  try {
    const initialData = await fetchRSS('top');
    return { props: { initialData } };
  } catch (error) {
    return { props: { error: 'Failed to fetch initial data' } };
  }
}

const Home = ({ initialData, error }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';

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
        <div>{error}</div>
      ) : (
        <Frame initialData={initialData} />
      )}
    </div>
  );
};

export default Home;