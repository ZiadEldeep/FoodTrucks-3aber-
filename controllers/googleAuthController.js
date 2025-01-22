const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handle Google Authentication
const handleGoogleAuth = async (req, res) => {
  const { token } = req.body; // Extract token from the request body
  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Use your actual client ID
    });

    const payload = ticket.getPayload();
    const userId = payload['sub']; // Unique Google user ID
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    console.log('Authenticated User:', { userId, email, name, picture });

    // Respond with user info
    res.json({ success: true, userId, email, name, picture });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { handleGoogleAuth };
