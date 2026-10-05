const express = require('express');
const router = express.Router();
const { recordTimerSession, getTimerHistory } = require('../controllers/timerController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', recordTimerSession);
router.get('/history', getTimerHistory);

module.exports = router;
