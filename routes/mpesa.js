const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');

// Generate access token
const generateAccessToken = async () => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY;
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
  
  console.log('MPesa Environment:', process.env.MPESA_ENVIRONMENT);
  console.log('Consumer Key exists:', !!consumer_key);
  console.log('Consumer Secret exists:', !!consumer_secret);
  console.log('Consumer Key length:', consumer_key?.length);
  console.log('Consumer Secret length:', consumer_secret?.length);
  
  if (!consumer_key || !consumer_secret) {
    throw new Error('MPesa consumer key or secret not configured');
  }
  
  const url = process.env.MPESA_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
  console.log('Auth URL:', url);
  console.log('Consumer Key:', consumer_key.substring(0, 10) + '...');
  console.log('Consumer Secret:', consumer_secret.substring(0, 10) + '...');
  console.log('Keys are identical:', consumer_key === consumer_secret);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    console.log('Access token generated successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Access token error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Failed to generate access token: ${error.response?.data?.error_description || error.message}`);
  }
};

// Initiate STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, account_reference, transaction_desc } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone number and amount are required' });
    }

    const access_token = await generateAccessToken();
    const url = process.env.MPESA_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    console.log('Shortcode:', shortcode);
    console.log('Passkey configured:', passkey !== 'your_passkey_here');
    console.log('Timestamp:', timestamp);
    
    if (!shortcode || !passkey || passkey === 'your_passkey_here') {
      throw new Error('MPesa shortcode or passkey not properly configured');
    }
    
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.BASE_URL}/mpesa/callback`,
      AccountReference: account_reference || "GarienFashion",
      TransactionDesc: transaction_desc || "Payment for products"
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: 'STK push initiated successfully',
      data: response.data
    });

  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});

// MPesa callback
router.post('/callback', (req, res) => {
  try {
    console.log('MPesa Callback received:', JSON.stringify(req.body, null, 2));

    const callbackData = req.body;
    
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;
      
      const paymentData = {};
      items.forEach(item => {
        switch(item.Name) {
          case 'Amount':
            paymentData.amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            paymentData.mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            paymentData.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            paymentData.phoneNumber = item.Value;
            break;
        }
      });

      console.log('Payment successful:', paymentData);
      
      // Here you can save the payment details to your database
      // Example: savePaymentToDatabase(paymentData);
      
    } else {
      // Payment failed
      console.log('Payment failed:', callbackData.Body.stkCallback.ResultDesc);
    }

    // Always respond with success to acknowledge receipt
    res.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.json({ ResultCode: 1, ResultDesc: "Error processing callback" });
  }
});

// Check transaction status
router.post('/status', async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({ error: 'CheckoutRequestID is required' });
    }

    const access_token = await generateAccessToken();
    const url = process.env.MPESA_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Status Check Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check transaction status',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
