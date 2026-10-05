const { getPool } = require('../config/db');

async function seedUserData(userId) {
  const pool = getPool();

  // Check if user already has subjects
  const [existingSubjects] = await pool.query('SELECT COUNT(*) as count FROM subjects WHERE user_id = ?', [userId]);
  if (existingSubjects[0].count > 0) {
    return; // Already has data
  }

  // 1. Insert Sample Subjects
  const subjectsData = [
    ['Data Structures & Algorithms', 'CS201', 'Core CS course covering trees, graphs, sorting, and complexity analysis.'],
    ['Database Management Systems', 'CS304', 'Relational database design, SQL querying, indexing, and normalization.'],
    ['Computer Networks', 'CS401', 'OSI model, TCP/IP protocols, routing algorithms, and network security.'],
    ['Web Development', 'CS308', 'Full stack modern web development with React, Node.js, and REST APIs.'],
    ['Artificial Intelligence', 'CS450', 'Search algorithms, heuristics, machine learning foundations, and neural networks.']
  ];

  const subjectIds = {};
  for (const [name, code, desc] of subjectsData) {
    const [result] = await pool.query(
      'INSERT INTO subjects (user_id, name, code, description) VALUES (?, ?, ?, ?)',
      [userId, name, code, desc]
    );
    subjectIds[name] = result.insertId;
  }

  // 2. Insert Sample Tasks
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const tasksData = [
    [subjectIds['Data Structures & Algorithms'], 'Complete Binary Search Tree Lab Assignment', 'Implement AVL balance rotations and traversal operations in C++', today, '17:00:00', 'High', 'In Progress'],
    [subjectIds['Database Management Systems'], 'Study SQL Joins and Query Optimization', 'Practice complex multi-table joins, subqueries, and index analysis', today, '20:30:00', 'Medium', 'Pending'],
    [subjectIds['Web Development'], 'Build React Task Component with Tailwind', 'Create responsive card layout and filter bar for project', today, '22:00:00', 'High', 'Completed'],
    [subjectIds['Computer Networks'], 'Read Computer Networks Unit 3 Notes', 'Review subnetting, CIDR notation, and distance vector routing', tomorrow, '18:00:00', 'Medium', 'Pending'],
    [subjectIds['Artificial Intelligence'], 'Complete AI Heuristic Search Worksheet', 'Solve A* search problems and Manhattan distance calculations', inTwoDays, '16:00:00', 'Low', 'Pending'],
    [subjectIds['Data Structures & Algorithms'], 'Review Sorting Algorithms for Midterm', 'Quicksort, Mergesort, and Heapsort worst case complexity breakdown', inThreeDays, '14:00:00', 'High', 'Pending']
  ];

  for (const [subId, title, desc, date, time, priority, status] of tasksData) {
    await pool.query(
      'INSERT INTO tasks (user_id, subject_id, title, description, due_date, due_time, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, subId, title, desc, date, time, priority, status]
    );
  }

  // 3. Insert Study Schedule Sessions
  const sessionsData = [
    [subjectIds['Data Structures & Algorithms'], 'Graph Traversal (BFS & DFS)', today, '09:00:00', '10:30:00', 'Focus on cycle detection in directed graphs'],
    [subjectIds['Database Management Systems'], 'Normalization 3NF & BCNF', today, '14:00:00', '15:30:00', 'Prepare presentation slides for group seminar'],
    [subjectIds['Web Development'], 'React Hooks & State Management', tomorrow, '10:00:00', '11:45:00', 'Build custom hooks for localStorage and API fetching'],
    [subjectIds['Computer Networks'], 'TCP 3-Way Handshake & Flow Control', inTwoDays, '15:00:00', '16:30:00', 'Diagram TCP state transition machine'],
    [subjectIds['Artificial Intelligence'], 'Minimax Algorithm with Alpha-Beta Pruning', inThreeDays, '11:00:00', '12:30:00', 'Game tree evaluation examples']
  ];

  for (const [subId, topic, date, start, end, notes] of sessionsData) {
    await pool.query(
      'INSERT INTO study_sessions (user_id, subject_id, topic, session_date, start_time, end_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, subId, topic, date, start, end, notes]
    );
  }

  // 4. Insert Sample Goals
  const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const inOneWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const inThreeWeeks = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];

  const goalsData = [
    ['Master React & Modern Web Dev Course', 'Complete 10 hands-on projects and master full-stack patterns', inTwoWeeks, 75, 'Active'],
    ['Ace DBMS Midterm Exam', 'Score >90% on relational algebra, SQL optimization, and ACID properties', inOneWeek, 60, 'Active'],
    ['Solve 50 LeetCode Medium Problems', 'Focus on Dynamic Programming, Trees, and Two Pointers', inThreeWeeks, 40, 'Active'],
    ['Finish Operating Systems Term Paper', 'Complete bibliography and peer review section', today, 100, 'Completed']
  ];

  for (const [title, desc, targetDate, progress, status] of goalsData) {
    await pool.query(
      'INSERT INTO goals (user_id, title, description, target_date, progress, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, desc, targetDate, progress, status]
    );
  }

  // 5. Insert Sample Timer Sessions (past 4 days)
  const timerData = [
    [25, 0],  // today
    [45, 1],  // 1 day ago
    [25, 2],  // 2 days ago
    [60, 3],  // 3 days ago
    [50, 4]   // 4 days ago
  ];

  for (const [minutes, daysAgo] of timerData) {
    const sessionDate = new Date(Date.now() - daysAgo * 86400000);
    await pool.query(
      'INSERT INTO study_timer_sessions (user_id, duration_minutes, completed_at) VALUES (?, ?, ?)',
      [userId, minutes, sessionDate]
    );
  }
}

module.exports = {
  seedUserData
};
