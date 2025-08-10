const express = require('express');
const { generateUploadUrl } = require('@vercel/blob');
const router = express.Router();

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
