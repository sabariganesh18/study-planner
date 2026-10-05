const { getPool } = require('../config/db');

// GET /api/study-sessions
async function getSessions(req, res, next) {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        ss.id,
        ss.user_id,
        ss.subject_id,
        ss.topic,
        DATE_FORMAT(ss.session_date, '%Y-%m-%d') AS session_date,
        TIME_FORMAT(ss.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ss.end_time, '%H:%i') AS end_time,
        ss.notes,
        ss.created_at,
        s.name AS subject_name,
        s.code AS subject_code
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.user_id = ?
    `;
    const queryParams = [userId];

    if (start_date && end_date) {
      query += ' AND ss.session_date BETWEEN ? AND ?';
      queryParams.push(start_date, end_date);
    }

    query += ' ORDER BY ss.session_date ASC, ss.start_time ASC';

    const [sessions] = await pool.query(query, queryParams);

    return res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

// POST /api/study-sessions
async function createSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { subject_id, topic, session_date, start_time, end_time, notes } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }
    if (!session_date) {
      return res.status(400).json({ success: false, message: 'Session date is required.' });
    }
    if (!start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Start and end times are required.' });
    }

    // Validate end_time > start_time
    if (end_time <= start_time) {
      return res.status(400).json({ success: false, message: 'End time must be later than start time.' });
    }

    const pool = getPool();

    let validSubjectId = null;
    if (subject_id) {
      const [subRows] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, userId]);
      if (subRows.length > 0) {
        validSubjectId = subject_id;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO study_sessions (user_id, subject_id, topic, session_date, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, validSubjectId, topic.trim(), session_date, start_time, end_time, notes ? notes.trim() : null]
    );

    const [createdRows] = await pool.query(`
      SELECT 
        ss.id, ss.user_id, ss.subject_id, ss.topic,
        DATE_FORMAT(ss.session_date, '%Y-%m-%d') AS session_date,
        TIME_FORMAT(ss.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ss.end_time, '%H:%i') AS end_time,
        ss.notes, ss.created_at,
        s.name AS subject_name, s.code AS subject_code
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.id = ?
    `, [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Study session scheduled successfully!',
      session: createdRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/study-sessions/:id
async function updateSession(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { subject_id, topic, session_date, start_time, end_time, notes } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }
    if (!session_date) {
      return res.status(400).json({ success: false, message: 'Session date is required.' });
    }
    if (!start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Start and end times are required.' });
    }

    if (end_time <= start_time) {
      return res.status(400).json({ success: false, message: 'End time must be later than start time.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM study_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    let validSubjectId = null;
    if (subject_id) {
      const [subRows] = await pool.query('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, userId]);
      if (subRows.length > 0) {
        validSubjectId = subject_id;
      }
    }

    await pool.query(
      `UPDATE study_sessions SET
        subject_id = ?, topic = ?, session_date = ?, start_time = ?, end_time = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [validSubjectId, topic.trim(), session_date, start_time, end_time, notes ? notes.trim() : null, sessionId, userId]
    );

    const [updatedRows] = await pool.query(`
      SELECT 
        ss.id, ss.user_id, ss.subject_id, ss.topic,
        DATE_FORMAT(ss.session_date, '%Y-%m-%d') AS session_date,
        TIME_FORMAT(ss.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(ss.end_time, '%H:%i') AS end_time,
        ss.notes, ss.created_at,
        s.name AS subject_name, s.code AS subject_code
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.id = ?
    `, [sessionId]);

    return res.json({
      success: true,
      message: 'Study session updated successfully!',
      session: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/study-sessions/:id
async function deleteSession(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM study_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Study session not found.' });
    }

    await pool.query('DELETE FROM study_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);

    return res.json({
      success: true,
      message: 'Study session deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession
};
