const express = require('express');
const { register, login, updatePassword } = require('../controllers/authController'); // Destructuring controller functions

const router = express.Router();

// Define the routes
router.post('/register', register); // Register endpoint
router.post('/login', login); // Login endpoint
router.put('/update-password', updatePassword); // Update password endpoint

module.exports = router;
