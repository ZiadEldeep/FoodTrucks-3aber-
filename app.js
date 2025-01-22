const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Import general auth routes
const googleAuthRoutes = require('./routes/googleAuthRoutes'); // Import Google auth routes

dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON bodies

// Use the general auth routes
app.use('/api/auth', authRoutes);

// Use the Google auth routes
app.use('/api/auth/google', googleAuthRoutes);

// Start the server
const port = process.env.PORT || 3000; // Port from .env or default to 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
