const { generateUploadUrl } = require('@vercel/blob');

module.exports = async (req, res) => {
  const allowedOrigins = [
    'https://garien-fashion.vercel.app',
    'http://localhost:4200'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST request to generate upload URL
  if (req.method === 'POST') {
    try {
      const { url } = await generateUploadUrl({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        access: 'public',
      });
      res.status(200).json({ uploadUrl: url });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}