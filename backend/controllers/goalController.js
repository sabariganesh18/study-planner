const { getPool } = require('../config/db');

// GET /api/goals
async function getGoals(req, res, next) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const query = `
      SELECT 
        id,
        user_id,
        title,
        description,
        DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
        progress,
        status,
        created_at
      FROM goals
      WHERE user_id = ?
      ORDER BY 
        FIELD(status, 'Active', 'Overdue', 'Completed'),
        target_date ASC
    `;

    const [rows] = await pool.query(query, [userId]);

    // Check overdue dynamically
    const today = new Date().toISOString().split('T')[0];
    const goals = rows.map(goal => {
      let currentStatus = goal.status;
      if (goal.progress >= 100) {
        currentStatus = 'Completed';
      } else if (goal.target_date && goal.target_date < today && currentStatus !== 'Completed') {
        currentStatus = 'Overdue';
      }
      return {
        ...goal,
        status: currentStatus
      };
    });

    return res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
}

// POST /api/goals
async function createGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, target_date, progress = 0, status = 'Active' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const numericProgress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    let initialStatus = ['Active', 'Completed', 'Overdue'].includes(status) ? status : 'Active';
    if (numericProgress === 100) initialStatus = 'Completed';

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO goals (user_id, title, description, target_date, progress, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title.trim(), description ? description.trim() : null, target_date || null, numericProgress, initialStatus]
    );

    const [createdRows] = await pool.query(`
      SELECT id, user_id, title, description, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date, progress, status, created_at
      FROM goals WHERE id = ?
    `, [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully!',
      goal: createdRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/goals/:id
async function updateGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { title, description, target_date, progress, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const numericProgress = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    let finalStatus = status;
    if (numericProgress >= 100) {
      finalStatus = 'Completed';
    } else if (finalStatus === 'Completed' && numericProgress < 100) {
      finalStatus = 'Active';
    }

    await pool.query(
      `UPDATE goals SET
        title = ?, description = ?, target_date = ?, progress = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), description ? description.trim() : null, target_date || null, numericProgress, finalStatus || 'Active', goalId, userId]
    );

    const [updatedRows] = await pool.query(`
      SELECT id, user_id, title, description, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date, progress, status, created_at
      FROM goals WHERE id = ?
    `, [goalId]);

    return res.json({
      success: true,
      message: 'Goal updated successfully!',
      goal: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/goals/:id
async function deleteGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);

    return res.json({
      success: true,
      message: 'Goal deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
