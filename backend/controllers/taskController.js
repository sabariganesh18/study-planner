const { getPool } = require('../config/db');

// GET /api/tasks
async function getTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, priority, subject_id, search, date } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        t.id,
        t.user_id,
        t.subject_id,
        t.title,
        t.description,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        TIME_FORMAT(t.due_time, '%H:%i') AS due_time,
        t.priority,
        t.status,
        t.created_at,
        s.name AS subject_name,
        s.code AS subject_code
      FROM tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.user_id = ?
    `;

    const queryParams = [userId];

    if (status && status !== 'All') {
      query += ' AND t.status = ?';
      queryParams.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND t.priority = ?';
      queryParams.push(priority);
    }

    if (subject_id && subject_id !== 'All') {
      query += ' AND t.subject_id = ?';
      queryParams.push(subject_id);
    }

    if (date) {
      if (date === 'today') {
        query += ' AND t.due_date = CURDATE()';
      } else if (date === 'upcoming') {
        query += ' AND t.due_date > CURDATE()';
      } else {
        query += ' AND t.due_date = ?';
        queryParams.push(date);
      }
    }

    if (search && search.trim()) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ? OR s.name LIKE ?)';
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term);
    }

    query += ' ORDER BY t.due_date ASC, t.due_time ASC, FIELD(t.priority, "High", "Medium", "Low")';

    const [tasks] = await pool.query(query, queryParams);

    return res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
}

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, subject_id, due_date, due_time, priority = 'Medium', status = 'Pending' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const pool = getPool();

    // Verify subject belongs to user if provided
    let validSubjectId = null;
    if (subject_id) {
      const [subRows] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, userId]);
      if (subRows.length > 0) {
        validSubjectId = subject_id;
      }
    }

    const validPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';
    const validStatus = ['Pending', 'In Progress', 'Completed'].includes(status) ? status : 'Pending';

    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, subject_id, title, description, due_date, due_time, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        validSubjectId,
        title.trim(),
        description ? description.trim() : null,
        due_date || null,
        due_time || null,
        validPriority,
        validStatus
      ]
    );

    const [createdRows] = await pool.query(`
      SELECT 
        t.id, t.user_id, t.subject_id, t.title, t.description,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        TIME_FORMAT(t.due_time, '%H:%i') AS due_time,
        t.priority, t.status, t.created_at,
        s.name AS subject_name, s.code AS subject_code
      FROM tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `, [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task: createdRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, subject_id, due_date, due_time, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    let validSubjectId = null;
    if (subject_id) {
      const [subRows] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, userId]);
      if (subRows.length > 0) {
        validSubjectId = subject_id;
      }
    }

    const validPriority = ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium';
    const validStatus = ['Pending', 'In Progress', 'Completed'].includes(status) ? status : 'Pending';

    await pool.query(
      `UPDATE tasks SET 
        title = ?, description = ?, subject_id = ?, due_date = ?, due_time = ?, priority = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        description ? description.trim() : null,
        validSubjectId,
        due_date || null,
        due_time || null,
        validPriority,
        validStatus,
        taskId,
        userId
      ]
    );

    const [updatedRows] = await pool.query(`
      SELECT 
        t.id, t.user_id, t.subject_id, t.title, t.description,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        TIME_FORMAT(t.due_time, '%H:%i') AS due_time,
        t.priority, t.status, t.created_at,
        s.name AS subject_name, s.code AS subject_code
      FROM tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `, [taskId]);

    return res.json({
      success: true,
      message: 'Task updated successfully!',
      task: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/tasks/:id/status
async function updateTaskStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?', [status, taskId, userId]);

    const [updatedRows] = await pool.query(`
      SELECT 
        t.id, t.user_id, t.subject_id, t.title, t.description,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        TIME_FORMAT(t.due_time, '%H:%i') AS due_time,
        t.priority, t.status, t.created_at,
        s.name AS subject_name, s.code AS subject_code
      FROM tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `, [taskId]);

    return res.json({
      success: true,
      message: `Task marked as ${status}!`,
      task: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    return res.json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
