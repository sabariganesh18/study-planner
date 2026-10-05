const { getPool } = require('../config/db');

// POST /api/timer
async function recordTimerSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { duration_minutes } = req.body;

    const duration = parseInt(duration_minutes, 10);
    if (!duration || duration <= 0) {
      return res.status(400).json({ success: false, message: 'Valid duration in minutes is required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO study_timer_sessions (user_id, duration_minutes) VALUES (?, ?)',
      [userId, duration]
    );

    const [created] = await pool.query(
      'SELECT id, duration_minutes, completed_at FROM study_timer_sessions WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: `Great job! ${duration} minutes study session recorded.`,
      session: created[0]
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/timer/history
async function getTimerHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [sessions] = await pool.query(
      `SELECT id, duration_minutes, completed_at 
       FROM study_timer_sessions 
       WHERE user_id = ? 
       ORDER BY completed_at DESC 
       LIMIT 20`,
      [userId]
    );

    const [[total]] = await pool.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS totalMinutes, COUNT(*) AS totalSessions 
       FROM study_timer_sessions 
       WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      sessions,
      totalMinutes: Number(total.totalMinutes) || 0,
      totalSessions: Number(total.totalSessions) || 0
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  recordTimerSession,
  getTimerHistory
};
