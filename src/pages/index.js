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

  const currentImage = category && articles.length > 0 ? articles[0].imageUrl : defaultImage;

  return (
    <div>
      <Head>
        <title>AP News Farcaster Frame</title>
        <meta property="og:title" content="AP News" />
        <meta property="og:image" content={currentImage} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={currentImage} />
        <meta property="fc:frame:button:1" content={category ? "Next" : "Top"} />
        <meta property="fc:frame:button:2" content={category ? "Back" : "World"} />
        <meta property="fc:frame:button:3" content={category ? "Read" : "US"} />
        <meta property="fc:frame:button:4" content={category ? "Home" : "Biz"} />
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