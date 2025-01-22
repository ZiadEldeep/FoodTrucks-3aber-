const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Prisma client
const prismaClient = new PrismaClient();

// API keys and settings
const FORJAWALY_API_KEY = process.env.FORJAWALY_API_KEY;
const FORJAWALY_API_SECRET = process.env.FORJAWALY_API_SECRET;
const FORJAWALY_SENDER = process.env.FORJAWALY_SENDER;
const FORJAWALY_API_URL = 'https://api-sms.4jawaly.com/api/v1/';

// Register API
app.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Name, email, password, and phone are required' });
  }

  try {
    // Check if the phone number already exists
    const existingPhone = await prismaClient.phone.findUnique({
      where: { phone: phone },
    });

    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number is already registered' });
    }

    // Check if the email already exists
    const existingEmail = await prismaClient.phone.findUnique({
      where: { email: email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // If no email is provided, generate a unique one
    const userEmail = email || `${phone}@example.com`;

    // Create the user in the database without hashing the password
    const newPhone = await prismaClient.phone.create({
      data: {
        phone: phone,
        email: userEmail, // Use the default email if not provided
        password: password,
        createdAt: new Date(),
      },
    });

    // Send SMS via 4Jawaly API
    const smsMessage = `Hello ${name}, your account has been successfully registered!`;
    const response = await sendSms(phone, smsMessage);

    // Check if SMS was sent successfully
    if (response.status === 'success') {
      res.status(201).json({ message: 'User registered and SMS sent successfully', phone: newPhone });
    } else {
      res.status(500).json({ error: 'User registered, but failed to send SMS' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

// Function to send SMS using 4Jawaly API
async function sendSms(phone, message) {
  try {
    const response = await axios.post(FORJAWALY_API_URL, {
      api_key: FORJAWALY_API_KEY,
      api_secret: FORJAWALY_API_SECRET,
      to: phone,
      from: FORJAWALY_SENDER,
      message: message,
    });

    return response.data; // Returns the response data from 4Jawaly API
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
}
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if the user exists by email
    const user = await prismaClient.phone.findUnique({
      where: { email: email }, // Looking for the user by email
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Login successful
    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login user', details: error.message });
  }
});
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
