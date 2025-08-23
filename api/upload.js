const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');

const app = express();

// Allowed origins
const allowedOrigins = [
  'https://garien-fashion.vercel.app',
  'http://localhost:4200'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With']
}));

app.use(express.json());

// Mount upload route at root since Vercel routes /upload to this file
app.use('/', uploadRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
