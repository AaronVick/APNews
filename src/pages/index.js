import Head from 'next/head';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const defaultImage = `${baseUrl}/trending-news-placeholder.png`;

  return {
    props: { 
      imageUrl: defaultImage,
    }
  };
}

const Home = ({ imageUrl }) => {
  return (
    <div>
      <Head>
        <title>AP News Farcaster Frame</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content="Top" />
        <meta property="fc:frame:button:2" content="World" />
        <meta property="fc:frame:button:3" content="US" />
        <meta property="fc:frame:button:4" content="Biz" />
        <meta property="og:image" content={imageUrl} />
      </Head>
    </div>
  );
};

export default Home;