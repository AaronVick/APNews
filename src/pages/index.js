import Head from 'next/head';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const imageUrl = `${baseUrl}/trending-news-placeholder.png`;

  return {
    props: { 
      baseUrl,
      imageUrl,
    }
  };
}

const Home = ({ baseUrl, imageUrl }) => {
  return (
    <>
      <Head>
        <title>AP News Farcaster Frame</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content="Top" />
        <meta property="fc:frame:button:2" content="World" />
        <meta property="fc:frame:button:3" content="US" />
        <meta property="fc:frame:button:4" content="Biz" />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/handleAction`} />
      </Head>
      <div>AP News Farcaster Frame</div>
    </>
  );
};

export default Home;