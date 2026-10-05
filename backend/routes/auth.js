const express = require('express');
const router = express.Router();
const { register, login, populateSampleData } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/seed', verifyToken, populateSampleData);

module.exports = router;
