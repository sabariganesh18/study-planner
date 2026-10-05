# 🎓 StudyMate — Modern College Study Planner

A full-stack study planner and productivity application built specifically for college students to organize coursework, track study hours, schedule revision blocks, set academic goals, and analyze learning progress.

---

## 🚀 Features

- **📊 Dynamic Dashboard**
  - Time-aware student greeting (`Good Morning/Afternoon/Evening, [Name]`)
  - Real-time KPI statistics cards: *Today's Tasks*, *Completed Tasks*, *Pending Tasks*, and *Total Study Hours*
  - Today's tasks with instant one-click completion toggle
  - Upcoming task deadlines and weekly progress bars
  - Quick action shortcuts for instant task, session, subject, and goal creation

- **✅ My Tasks Management**
  - Full CRUD operations (Add, Edit, Delete, View details)
  - Priority levels: `Low 🟢`, `Medium 🟡`, `High 🔴`
  - Status management: `Pending`, `In Progress`, `Completed`
  - Instant status toggle with visual completion effects
  - Fast search by title/description and multi-filter by Status, Priority, and Subject

- **📅 Weekly Study Schedule**
  - Interactive Monday–Sunday timeline view
  - Week switcher (Previous Week, Current Week, Next Week)
  - Schedule study blocks with Subject, Topic, Date, Start Time, End Time, and Notes
  - Validation ensuring End Time is after Start Time

- **📚 Academic Subjects**
  - Course enrollment management (Subject Name, Course Code, Syllabus Description)
  - Course cards with total task count, completed count, and dynamic mastery percentage
  - Quick-add task button directly tied to any subject

- **🎯 Study Goals & Milestones**
  - Set semester goals with target deadlines and milestone notes
  - Interactive progress slider and quick increment buttons (`-10%`, `+10%`, `+25%`)
  - Auto-calculated statuses: `Active`, `Completed`, and `Overdue`

- **📈 Progress & Analytics Dashboard**
  - Visual charts powered by Recharts
  - **Weekly Study Hours** (Past 7 days bar chart)
  - **Task Completion Breakdown** (Donut / Pie chart)
  - **Subject-by-Subject Mastery** (Horizontal bar chart)
  - Aggregated metrics updated dynamically across the platform

- **⏱️ Daily Study Focus Timer (Pomodoro)**
  - Native JavaScript timer (Zero external APIs required)
  - Presets: **25 min** (Standard), **45 min** (Deep Focus), **60 min** (Intense), and **5 min** (Rest Break)
  - Controls: Start, Pause, Reset
  - Automatic session logging to the database upon completion with total study hours update
  - Recent study session history timeline

- **👤 Student Profile & Security**
  - View account info, registration date, and overall study stats
  - Update student display name
  - Change password with old/new validation
  - 1-click **Load Starter College Data** button for instant demo evaluation

- **🔒 Authentication & Multi-Tenancy**
  - JSON Web Token (JWT) authentication stored securely in localStorage
  - Password hashing via `bcryptjs`
  - Strict user-level data isolation (users only access their own records)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS (Modern, clean, light-blue & navy student theme)
- **Routing:** React Router v7
- **HTTP Client:** Axios (with request & response JWT interceptors)
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **API Architecture:** RESTful API
- **Authentication:** JWT (`jsonwebtoken`) & `bcryptjs`
- **Database Driver:** `mysql2` (with connection pooling and automatic table creation)

### Database
- **Engine:** MySQL 8.0+
- **Schema:** Relational tables with foreign key cascades and integrity constraints

---

## 📁 Project Structure

```
study-planner/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL pool & auto-table initializer
│   ├── controllers/
│   │   ├── authController.js     # Register, login, demo seed
│   │   ├── taskController.js     # Task CRUD, filters, status patch
│   │   ├── subjectController.js  # Subject CRUD & progress calculation
│   │   ├── sessionController.js  # Weekly schedule sessions
│   │   ├── goalController.js     # Goals CRUD & overdue logic
│   │   ├── progressController.js # Analytics & aggregated statistics
│   │   ├── timerController.js    # Focus timer logging & history
│   │   └── profileController.js  # Student profile & password update
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── errorHandler.js       # Centralized error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── subjects.js
│   │   ├── studySessions.js
│   │   ├── goals.js
│   │   ├── progress.js
│   │   ├── timer.js
│   │   └── profile.js
│   ├── utils/
│   │   ├── seedHelper.js         # Sample starter student data generator
│   │   └── runSeed.js            # CLI seed runner script
│   ├── .env
│   ├── package.json
│   └── server.js                 # Main server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Header bar with timer shortcut & user badge
│   │   │   ├── Sidebar.jsx       # Responsive desktop/mobile navigation
│   │   │   ├── StatCard.jsx      # Reusable KPI card
│   │   │   ├── ProgressBar.jsx   # Animated progress bar
│   │   │   ├── EmptyState.jsx    # User-friendly empty state container
│   │   │   ├── TaskModal.jsx     # Add/Edit task modal
│   │   │   ├── SubjectModal.jsx  # Add/Edit subject modal
│   │   │   ├── SessionModal.jsx  # Add/Edit study session modal
│   │   │   └── GoalModal.jsx     # Add/Edit goal modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global auth state & token persistence
│   │   │   └── ToastContext.jsx  # Global toast notification alerts
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx    # App layout container
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   ├── StudySchedule.jsx
│   │   │   ├── Subjects.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── DailyTimer.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with helper methods
│   │   ├── App.jsx               # Protected & public routes
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind base & custom scrollbars
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── database/
│   ├── schema.sql                # Complete MySQL DDL table schema
│   └── seed.sql                  # Sample student seed records
│
├── .env.example
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `backend/` or in the project root:

```env
# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=studymate_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=studymate_super_secret_jwt_key_2026_modern_planner
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_URL=http://localhost:5173
```

---

## 📦 Installation & Setup

### 1. Clone & Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Database Initialization

Make sure MySQL server is running locally. You can seed the database directly using:

```bash
cd backend
npm run seed
```

*(Note: The server also auto-creates all required tables on startup if they do not exist!)*

---

## 🏃 Running the Application

### Option A: Run Backend Server
```bash
cd backend
npm start
# Server starts on http://localhost:5000
```

### Option B: Run Frontend Dev Server
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:5173 (or next open port)
```

---

## 🔑 Demo Account Credentials

Use the **"Fill Demo Student Credentials"** button on the Login page, or enter:

- **Email:** `alex@studymate.edu`
- **Password:** `Password123!`

*(You can also click **"Load Sample College Data"** in the sidebar or profile page at any time to re-populate sample college subjects, tasks, schedule, and goals!)*

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `POST` | `/api/auth/seed` | Populate starter student sample data | Yes |
| `GET` | `/api/profile` | Get current student profile & stats | Yes |
| `PUT` | `/api/profile` | Update name or password | Yes |
| `GET` | `/api/subjects` | List subjects with task progress | Yes |
| `POST` | `/api/subjects` | Add new subject | Yes |
| `PUT` | `/api/subjects/:id` | Update subject | Yes |
| `DELETE` | `/api/subjects/:id` | Delete subject | Yes |
| `GET` | `/api/tasks` | Get tasks (supports filters & search) | Yes |
| `POST` | `/api/tasks` | Create new study task | Yes |
| `PUT` | `/api/tasks/:id` | Update task details | Yes |
| `PATCH` | `/api/tasks/:id/status`| Quick update task status | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes |
| `GET` | `/api/study-sessions` | Get weekly schedule sessions | Yes |
| `POST` | `/api/study-sessions` | Schedule new study session | Yes |
| `PUT` | `/api/study-sessions/:id` | Update study session | Yes |
| `DELETE` | `/api/study-sessions/:id` | Delete study session | Yes |
| `GET` | `/api/goals` | Get student goals & progress | Yes |
| `POST` | `/api/goals` | Create new goal | Yes |
| `PUT` | `/api/goals/:id` | Update goal & progress % | Yes |
| `DELETE` | `/api/goals/:id` | Delete goal | Yes |
| `GET` | `/api/progress` | Aggregated analytics & charts data | Yes |
| `POST` | `/api/timer` | Log completed focus timer session | Yes |
| `GET` | `/api/timer/history` | Get recent timer sessions & hours | Yes |

---

## 🛡️ Validation & Error Handling

- **Email Validation:** RFC standard regex validation on frontend & backend.
- **Password Constraints:** Minimum 6 characters with confirmation check.
- **Time Logic:** Automatically validates that study session `end_time` is after `start_time`.
- **Progress Boundaries:** Progress percentages are clamped between `0%` and `100%`.
- **Friendly UX States:** Includes custom loading indicators, interactive toast feedback alerts, responsive empty states, and a 404 page.

---

## 📄 License
MIT License. Built for students with ❤️.
