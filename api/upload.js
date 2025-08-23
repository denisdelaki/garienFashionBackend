require('dotenv').config();
const cors = require('cors');
const { generateUploadUrl } = require('@vercel/blob');

const allowedOrigins = ['https://garien-fashion.vercel.app', 'http://localhost:4200'];

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
  optionsSuccessStatus: 204,
};

module.exports = async (req, res) => {
  cors(corsOptions)(req, res, async () => {
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method === 'POST') {
      try {
        console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Present' : 'Missing');
        const { url } = await generateUploadUrl({
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          access: 'public',
        });
        res.status(200).json({ uploadUrl: url });
      } catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
};