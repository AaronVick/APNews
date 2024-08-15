import Head from 'next/head';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const imageUrl = `${baseUrl}/trending-news-placeholder.png`; // Use the correct image name

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
        <title>AP Top News Farcaster Frame</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        
        <meta property="fc:frame:button:1" content="Show Top Headlines" />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/handleAction`} />

        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Trending+News+from+the+Associated+Press%0A%0Aframe+by+%40aaronv&embeds[]=https%3A%2F%2Fap-news.vercel.app%2F" />


      </Head>
      <div>
        <h1>AP Top News</h1>
        <img src={imageUrl} alt="AP News Logo" />
        <div>
          <button>Show Top Headlines</button>
        </div>
      </div>
    </>
  );
};

export default Home;
