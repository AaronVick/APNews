export default function handler(req, res) {
  if (req.method === 'POST') {
    // Log the request body to help with debugging
    console.log('Received POST request:', req.body);

    // Send a simple response
    res.status(200).json({
      frames: [
        {
          version: 'vNext',
          image: `${process.env.NEXT_PUBLIC_BASE_URL}/trending-news-placeholder.png`,
          buttons: [
            { label: 'Back to Home' }
          ],
          title: 'Action Received'
        }
      ]
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}