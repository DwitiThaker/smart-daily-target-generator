import './Sidebar.css'
import ProgressBar from './ProgressBar'

export default function Sidebar({ student, plan }) {
  const totalMinutes = plan?.total_minutes ?? 0
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  const subjectsProgress = student?.subjects_progress ?? {}

  return (
    <aside className="sidebar">
      {/* Student Card */}
      <div className="sidebar-student-card">
        <div className="sidebar-avatar">
          {student ? student.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="sidebar-student-info">
          <p className="sidebar-student-name">{student?.name ?? 'No student loaded'}</p>
          <p className="sidebar-student-meta">
            {student ? `${student.study_hours_per_day}h / day · UPSC CSE` : 'Enter a Student ID above'}
          </p>
        </div>
      </div>

      {/* Today Stats */}
      {plan && (
        <div className="sidebar-stats-row">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{plan.daily_plan?.length ?? 0}</span>
            <span className="sidebar-stat-label">Tasks</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">
              {hours > 0 ? `${hours}h` : ''}{mins > 0 ? ` ${mins}m` : ''}
            </span>
            <span className="sidebar-stat-label">Total Time</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">
              {plan.daily_plan?.filter(t => t.category === 'weak_topic').length ?? 0}
            </span>
            <span className="sidebar-stat-label">Weak Topics</span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Subject Progress */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Subject Progress</h3>
        {Object.keys(subjectsProgress).length > 0 ? (
          <div className="sidebar-progress-list">
            {Object.entries(subjectsProgress).map(([subject, progress]) => (
              <ProgressBar key={subject} subject={subject} progress={progress} />
            ))}
          </div>
        ) : (
          <div className="sidebar-empty-state">
            <span className="sidebar-empty-icon">📊</span>
            <p>Load a student to see subject progress</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Quick Tips */}
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Study Tips</h3>
        <div className="sidebar-tips">
          <div className="sidebar-tip">
            <span>🎯</span>
            <p>Focus on weak topics first when energy is high</p>
          </div>
          <div className="sidebar-tip">
            <span>⏱️</span>
            <p>Use Pomodoro: 25 min study, 5 min break</p>
          </div>
          <div className="sidebar-tip">
            <span>📝</span>
            <p>Write notes after each topic to retain better</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
