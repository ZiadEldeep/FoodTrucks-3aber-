const express = require('express');
const router = express.Router();
const { handleGoogleAuth } = require('../controllers/googleAuthController');

// Route for Google Authentication
router.post('/google', handleGoogleAuth);

module.exports = router;
