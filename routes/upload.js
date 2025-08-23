const express = require('express');
const { generateUploadUrl } = require('@vercel/blob');
const router = express.Router();
const cors = require('cors');

// Define allowed origins
const allowedOrigins = [
  'https://garien-fashion.vercel.app',
  'http://localhost:4200',
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204, // Return 204 for OPTIONS requests
};

// Apply CORS middleware to the router
router.use(cors(corsOptions));

// Explicitly handle OPTIONS request for /upload
router.options('/upload', (req, res) => {
  res.status(204).end();
});

// Upload URL route
router.post('/upload', async (req, res) => {
  try {
    const { url } = await generateUploadUrl({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
      access: 'public',
    });
    res.json({ uploadUrl: url });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

module.exports = router;