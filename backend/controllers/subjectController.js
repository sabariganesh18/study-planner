const { getPool } = require('../config/db');

// GET /api/subjects
async function getSubjects(req, res, next) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const query = `
      SELECT 
        s.id,
        s.name,
        s.code,
        s.description,
        s.created_at,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
      FROM subjects s
      LEFT JOIN tasks t ON s.id = t.subject_id AND t.user_id = ?
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.name ASC
    `;

    const [rows] = await pool.query(query, [userId, userId]);

    const subjects = rows.map(sub => {
      const total = Number(sub.total_tasks) || 0;
      const completed = Number(sub.completed_tasks) || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        description: sub.description,
        created_at: sub.created_at,
        totalTasks: total,
        completedTasks: completed,
        progress
      };
    });

    return res.json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
}

// POST /api/subjects
async function createSubject(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO subjects (user_id, name, code, description) VALUES (?, ?, ?, ?)',
      [userId, name.trim(), code ? code.trim() : null, description ? description.trim() : null]
    );

    const [created] = await pool.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Subject added successfully!',
      subject: {
        ...created[0],
        totalTasks: 0,
        completedTasks: 0,
        progress: 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/subjects/:id
async function updateSubject(req, res, next) {
  try {
    const userId = req.user.id;
    const subjectId = req.params.id;
    const { name, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subjectId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await pool.query(
      'UPDATE subjects SET name = ?, code = ?, description = ? WHERE id = ? AND user_id = ?',
      [name.trim(), code ? code.trim() : null, description ? description.trim() : null, subjectId, userId]
    );

    const [updated] = await pool.query('SELECT * FROM subjects WHERE id = ?', [subjectId]);

    return res.json({
      success: true,
      message: 'Subject updated successfully!',
      subject: updated[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/subjects/:id
async function deleteSubject(req, res, next) {
  try {
    const userId = req.user.id;
    const subjectId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subjectId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await pool.query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [subjectId, userId]);

    return res.json({
      success: true,
      message: 'Subject deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};
