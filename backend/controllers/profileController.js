const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

// GET /api/profile
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    // Summary counts
    const [[taskCounts]] = await pool.query(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTasks
      FROM tasks WHERE user_id = ?
    `, [userId]);

    const [[timerCounts]] = await pool.query(`
      SELECT COALESCE(SUM(duration_minutes), 0) as totalStudyMinutes
      FROM study_timer_sessions WHERE user_id = ?
    `, [userId]);

    return res.json({
      success: true,
      user: {
        ...user,
        totalTasks: taskCounts.totalTasks || 0,
        completedTasks: taskCounts.completedTasks || 0,
        totalStudyMinutes: timerCounts.totalStudyMinutes || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/profile
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;
    const pool = getPool();

    if (name && name.trim()) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }

      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
    }

    const [updatedRows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
