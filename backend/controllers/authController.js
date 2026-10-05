const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { seedUserData } = require('../utils/seedHelper');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'studymate_super_secret_jwt_key_2026_modern_planner',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, loadSampleData = true } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (Name, Email, Password).' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const pool = getPool();

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [trimmedName, trimmedEmail, hashedPassword]
    );

    const userId = result.insertId;

    // Seed sample data if requested
    if (loadSampleData) {
      try {
        await seedUserData(userId);
      } catch (seedErr) {
        console.warn('Sample seed non-fatal warning:', seedErr.message);
      }
    }

    const user = { id: userId, name: trimmedName, email: trimmedEmail };
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to StudyMate.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userRecord = rows[0];
    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email };
    const token = generateToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/seed
async function populateSampleData(req, res, next) {
  try {
    const userId = req.user.id;
    await seedUserData(userId);
    return res.json({ success: true, message: 'Sample study data loaded successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  populateSampleData
};
