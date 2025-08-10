const express = require('express');
const { generateUploadUrl } = require('@vercel/blob');
const router = express.Router();

// Allowed origins for CORS
const allowedOrigins = [
  'https://garien-fashion.vercel.app',
  'http://localhost:4200'
];

// CORS middleware for this route only
router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Stop here for preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Upload URL route
router.post('/upload', async (req, res) => {
  try {
    const { url } = await generateUploadUrl({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
      access: 'public'
    });

    res.json({ uploadUrl: url });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

module.exports = router;
