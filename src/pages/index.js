import React, { useState } from 'react';
import Head from 'next/head';
import Frame from '../components/Frame';
import fetchRSS from '../utils/fetchRSS';

export async function getServerSideProps() {
  return { props: {} }; // No initial fetch, we'll load data when a category is selected
}

const Home = () => {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const defaultImage = `${baseUrl}/trending-news-placeholder.png`;

  const handleCategorySelect = async (selectedCategory) => {
    const fetchedArticles = await fetchRSS(selectedCategory);
    setArticles(fetchedArticles);
    setCategory(selectedCategory);
  };

  const resetToHome = () => {
    setCategory(null);
    setArticles([]);
  };

  return (
    <div>
      <Head>
        <title>AP News Farcaster Frame</title>
        <meta property="og:title" content="AP News" />
        <meta property="og:image" content={category ? articles[0]?.imageUrl || defaultImage : defaultImage} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={category ? articles[0]?.imageUrl || defaultImage : defaultImage} />
        {!category ? (
          <>
            <meta property="fc:frame:button:1" content="Top" />
            <meta property="fc:frame:button:2" content="World" />
            <meta property="fc:frame:button:3" content="US" />
            <meta property="fc:frame:button:4" content="Biz" />
          </>
        ) : (
          <>
            <meta property="fc:frame:button:1" content="Next" />
            <meta property="fc:frame:button:2" content="Back" />
            <meta property="fc:frame:button:3" content="Read" />
            <meta property="fc:frame:button:4" content="Home" />
          </>
        )}
      </Head>
      {category ? (
        <Frame 
          articles={articles} 
          onHome={resetToHome}
        />
      ) : (
        <div>
          <h1>Select a News Category</h1>
          <img src={defaultImage} alt="Trending News" style={{ width: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default Home;