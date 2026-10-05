-- StudyMate Sample Data Seed Script
-- Default password for demo user is "Password123!" (bcrypt hash below)

USE studymate_db;

-- Demo user (id=1, email: alex@studymate.edu)
INSERT INTO users (id, name, email, password) VALUES 
(1, 'Alex Morgan', 'alex@studymate.edu', '$2b$10$4UmKzOsvnfLkARELkGw6.eMD7h5BhIVFeg0Z0spFe7WbB.VZmmdEO')
ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password);

-- Subjects for demo user
INSERT INTO subjects (id, user_id, name, code, description) VALUES
(1, 1, 'Data Structures & Algorithms', 'CS201', 'Core computer science course covering trees, graphs, sorting, and complexity analysis.'),
(2, 1, 'Database Management Systems', 'CS304', 'Relational database design, SQL querying, indexing, and normalization principles.'),
(3, 1, 'Computer Networks', 'CS401', 'OSI model, TCP/IP protocols, routing algorithms, and network security.'),
(4, 1, 'Web Development', 'CS308', 'Full stack modern web development with React, Node.js, and REST APIs.'),
(5, 1, 'Artificial Intelligence', 'CS450', 'Search algorithms, heuristics, machine learning foundations, and neural networks.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Tasks
INSERT INTO tasks (id, user_id, subject_id, title, description, due_date, due_time, priority, status) VALUES
(1, 1, 1, 'Complete Binary Search Tree Lab Assignment', 'Implement AVL balance rotations and traversal operations in C++', CURDATE(), '17:00:00', 'High', 'In Progress'),
(2, 1, 2, 'Study SQL Joins and Query Optimization', 'Practice complex multi-table joins, subqueries and index analysis', CURDATE(), '20:30:00', 'Medium', 'Pending'),
(3, 1, 4, 'Build React Task Component with Tailwind', 'Create responsive card layout and filter bar for project', CURDATE(), '22:00:00', 'High', 'Completed'),
(4, 1, 3, 'Read Computer Networks Unit 3 Notes', 'Review subnetting, CIDR notation and distance vector routing', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 'Medium', 'Pending'),
(5, 1, 5, 'Complete AI Heuristic Search Worksheet', 'Solve A* search problems and Manhattan distance calculations', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00', 'Low', 'Pending'),
(6, 1, 1, 'Review Sorting Algorithms for Midterm', 'Quicksort, Mergesort, and Heapsort worst case complexity breakdown', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', 'High', 'Pending')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Study Sessions (Schedule)
INSERT INTO study_sessions (id, user_id, subject_id, topic, session_date, start_time, end_time, notes) VALUES
(1, 1, 1, 'Graph Traversal (BFS & DFS)', CURDATE(), '09:00:00', '10:30:00', 'Focus on cycle detection in directed graphs'),
(2, 1, 2, 'Normalization 3NF & BCNF', CURDATE(), '14:00:00', '15:30:00', 'Prepare presentation slides for group seminar'),
(3, 1, 4, 'React Hooks & State Management', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:45:00', 'Build custom hooks for localStorage and API fetching'),
(4, 1, 3, 'TCP 3-Way Handshake & Congestion Control', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', '16:30:00', 'Diagram TCP state transition machine'),
(5, 1, 5, 'Minimax Algorithm with Alpha-Beta Pruning', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', '12:30:00', 'Game tree evaluation examples')
ON DUPLICATE KEY UPDATE topic=VALUES(topic);

-- Goals
INSERT INTO goals (id, user_id, title, description, target_date, progress, status) VALUES
(1, 1, 'Master React & Modern Web Dev Course', 'Complete 10 hands-on projects and master full-stack patterns', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 75, 'Active'),
(2, 1, 'Ace DBMS Midterm Exam', 'Score >90% on relational algebra, SQL optimization, and ACID properties', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 60, 'Active'),
(3, 1, 'Solve 50 LeetCode Medium Problems', 'Focus on Dynamic Programming, Trees, and Two Pointers', DATE_ADD(CURDATE(), INTERVAL 21 DAY), 40, 'Active'),
(4, 1, 'Finish Operating Systems Term Paper', 'Complete bibliography and peer review section', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 100, 'Completed')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Timer Sessions
INSERT INTO study_timer_sessions (id, user_id, duration_minutes, completed_at) VALUES
(1, 1, 25, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 1, 45, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 25, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 1, 60, DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE duration_minutes=VALUES(duration_minutes);
