const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Import routes
dotenv.config();

const app = express();
app.use(express.json());  // To parse JSON bodies

// Use the auth routes
app.use('/api/auth', authRoutes);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
