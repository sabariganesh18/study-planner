const { getPool } = require('../config/db');

// GET /api/progress
async function getProgressStats(req, res, next) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    // 1. Tasks breakdown
    const [tasksSummary] = await pool.query(`
      SELECT 
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingTasks,
        SUM(CASE WHEN due_date = CURDATE() THEN 1 ELSE 0 END) AS todayTasks,
        SUM(CASE WHEN due_date = CURDATE() AND status = 'Completed' THEN 1 ELSE 0 END) AS todayCompletedTasks
      FROM tasks
      WHERE user_id = ?
    `, [userId]);

    const taskStats = tasksSummary[0] || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      todayTasks: 0,
      todayCompletedTasks: 0
    };

    // 2. Goals breakdown
    const [goalsSummary] = await pool.query(`
      SELECT 
        COUNT(*) AS totalGoals,
        SUM(CASE WHEN status = 'Completed' OR progress >= 100 THEN 1 ELSE 0 END) AS completedGoals,
        SUM(CASE WHEN status != 'Completed' AND progress < 100 THEN 1 ELSE 0 END) AS activeGoals,
        COALESCE(AVG(progress), 0) AS averageGoalProgress
      FROM goals
      WHERE user_id = ?
    `, [userId]);

    const goalStats = goalsSummary[0] || {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      averageGoalProgress: 0
    };

    // 3. Study Timer Total Minutes
    const [[timerTotal]] = await pool.query(`
      SELECT COALESCE(SUM(duration_minutes), 0) AS totalStudyMinutes,
             COUNT(*) AS totalSessions
      FROM study_timer_sessions
      WHERE user_id = ?
    `, [userId]);

    const totalMinutes = Number(timerTotal.totalStudyMinutes) || 0;
    const totalStudyHours = parseFloat((totalMinutes / 60).toFixed(1));

    // 4. Weekly Study Hours (Past 7 Days)
    const [weeklyTimerRows] = await pool.query(`
      SELECT 
        DATE(completed_at) AS session_day,
        SUM(duration_minutes) AS daily_minutes
      FROM study_timer_sessions
      WHERE user_id = ? AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(completed_at)
    `, [userId]);

    const dailyMinutesMap = {};
    weeklyTimerRows.forEach(row => {
      const dayStr = new Date(row.session_day).toISOString().split('T')[0];
      dailyMinutesMap[dayStr] = Number(row.daily_minutes) || 0;
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyStudyChart = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const minutes = dailyMinutesMap[dayKey] || 0;
      const hours = parseFloat((minutes / 60).toFixed(2));

      weeklyStudyChart.push({
        date: dayKey,
        day: dayName,
        minutes,
        hours
      });
    }

    // 5. Subject Progress Breakdown
    const [subjectRows] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.code,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
      FROM subjects s
      LEFT JOIN tasks t ON s.id = t.subject_id AND t.user_id = ?
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.name ASC
    `, [userId, userId]);

    const subjectProgress = subjectRows.map(sub => {
      const total = Number(sub.total_tasks) || 0;
      const completed = Number(sub.completed_tasks) || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        totalTasks: total,
        completedTasks: completed,
        percentage
      };
    });

    const totalTaskCount = Number(taskStats.totalTasks) || 0;
    const completedTaskCount = Number(taskStats.completedTasks) || 0;
    const overallTaskProgress = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        totalStudyHours,
        totalStudyMinutes: totalMinutes,
        totalSessions: Number(timerTotal.totalSessions) || 0,
        totalTasks: totalTaskCount,
        completedTasks: completedTaskCount,
        inProgressTasks: Number(taskStats.inProgressTasks) || 0,
        pendingTasks: Number(taskStats.pendingTasks) || 0,
        todayTasks: Number(taskStats.todayTasks) || 0,
        todayCompletedTasks: Number(taskStats.todayCompletedTasks) || 0,
        overallTaskProgress,
        totalGoals: Number(goalStats.totalGoals) || 0,
        completedGoals: Number(goalStats.completedGoals) || 0,
        activeGoals: Number(goalStats.activeGoals) || 0,
        averageGoalProgress: Math.round(Number(goalStats.averageGoalProgress) || 0),
        weeklyStudyChart,
        subjectProgress
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProgressStats
};
