const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Replace with your M-Pesa API credentials
const API_KEY = 'your_api_key';
const PUBLIC_KEY = 'your_public_key';
const BUSINESS_SHORT_CODE = '174379'; // Replace with your business short code
const PASSKEY = 'your_passkey'; // Replace with your passkey
const API_HOST = 'https://sandbox.safaricom.co.ke'; // Use production URL for live environment

// Function to generate password
const generatePassword = (shortCode, passkey, timestamp) => {
    return Buffer.from(shortCode + passkey + timestamp).toString('base64');
};

// Function to generate timestamp
const generateTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Endpoint to initiate payment
app.post('/initiate-payment', async (req, res) => {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    try {
        // Step 1: Get Access Token
        const auth = Buffer.from(`${API_KEY}:${PUBLIC_KEY}`).toString('base64');
        const tokenResponse = await axios.get(`${API_HOST}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Step 2: Generate Password and Timestamp
        const timestamp = generateTimestamp();
        const password = generatePassword(BUSINESS_SHORT_CODE, PASSKEY, timestamp);

        // Step 3: Initiate STK Push
        const stkPushResponse = await axios.post(`${API_HOST}/mpesa/stkpush/v1/processrequest`, {
            BusinessShortCode: BUSINESS_SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: BUSINESS_SHORT_CODE,
            PhoneNumber: phoneNumber,
            CallBackURL: 'https://yourdomain.com/callback', // Replace with your callback URL
            AccountReference: accountReference,
            TransactionDesc: transactionDesc
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.status(200).json(stkPushResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});