const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Deshboard
router.get('/dashboard', (req, res) => res.render('welcome'));

module.exports = router;