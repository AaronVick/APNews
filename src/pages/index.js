import Head from 'next/head';

export async function getServerSideProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ap-news.vercel.app';
  const defaultImage = `${baseUrl}/trending-news-placeholder.png`;
  
  // Check if a button was clicked (you'd implement this logic based on Farcaster's API)
  const buttonClicked = context.query.button; // This is hypothetical; implement according to Farcaster's actual method

  let currentState = 'initial';
  if (buttonClicked) {
    // Handle button clicks here
    // This is where you'd implement the logic to fetch news for a category, etc.
    currentState = 'category-selected'; // This is just an example
  }

  return {
    props: { 
      imageUrl: defaultImage,
      currentState
    }
  };
}

const Home = ({ imageUrl, currentState }) => {
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
      </Head>
      <h1>Select a News Category</h1>
      {/* No visible content here; Farcaster will use the meta tags */}
    </div>
  );
};

export default Home;