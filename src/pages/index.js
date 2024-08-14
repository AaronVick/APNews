import Head from 'next/head';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const imageUrl = 'https://ap-news.vercel.app/ap-news-logo.png'; // Update this to your actual logo image

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