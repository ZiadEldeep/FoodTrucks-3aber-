const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prismaClient = new PrismaClient();
const FORJAWALY_API_KEY = process.env.FORJAWALY_API_KEY;
const FORJAWALY_API_SECRET = process.env.FORJAWALY_API_SECRET;
const FORJAWALY_SENDER = process.env.FORJAWALY_SENDER;
const FORJAWALY_API_URL = 'https://api-sms.4jawaly.com/api/v1/';
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit number
};
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Name, email, password, and phone are required' });
  }

  try {
    const existingPhone = await prismaClient.user.findUnique({
      where: { phone: phone },
    });

    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number is already registered' });
    }

    const existingEmail = await prismaClient.user.findUnique({
      where: { email: email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const userEmail = email || `${phone}@example.com`; // Default email if not provided
    const verificationCode = generateVerificationCode();

    const newPhone = await prismaClient.user.create({
      data: {
        phone: phone,
        email: userEmail,
        password: password,
        createdAt: new Date(),
      },
    });

    const smsMessage = `Hello ${name}, your verification code is: ${verificationCode}`;
    const response = await sendSms(phone, smsMessage);

    if (response.status === 'success') {
      res.status(201).json({
        message: 'User registered and SMS sent successfully',
        phone: newPhone,
        verificationCode,
      });
    } else {
      res.status(500).json({ error: 'User registered, but failed to send SMS' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login user', details: error.message });
  }
};
exports.updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Email, old password, and new password are required' });
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== oldPassword) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const updatedUser = await prismaClient.user.update({
      where: { email: email },
      data: {
        password: newPassword,
      },
    });

    return res.status(200).json({ message: 'Password updated successfully', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update password', details: error.message });
  }
};
async function sendSms(phone, message) {
  try {
    const response = await axios.post(FORJAWALY_API_URL, {
      api_key: FORJAWALY_API_KEY,
      api_secret: FORJAWALY_API_SECRET,
      to: phone,
      from: FORJAWALY_SENDER,
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
}
