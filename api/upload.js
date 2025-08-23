require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://garien-fashion.vercel.app'
  ],
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Mount upload route at root since Vercel routes /upload to this file
app.use('/', uploadRoutes);

module.exports = serverless(app);
