const express = require('express');
const router = express.Router();
const { getProgressStats } = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getProgressStats);

module.exports = router;
