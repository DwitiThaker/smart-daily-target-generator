import './TaskCard.css'

const CATEGORY_CONFIG = {
  weak_topic: {
    label: 'WEAK TOPIC',
    className: 'tag--weak',
  },
  new_topic: {
    label: 'NEW TOPIC',
    className: 'tag--new',
  },
  revision: {
    label: 'REVISION',
    className: 'tag--revision',
  },
}

const SUBJECT_ICONS = {
  Polity:      '⚖️',
  Economy:     '📘',
  History:     '🏛️',
  Geography:   '🗺️',
  Environment: '🌿',
  Science:     '🔬',
  Ethics:      '🧭',
}

const SUBJECT_BG = {
  Polity:      ['#eef2ff', '#6366f1'],
  Economy:     ['#fffbeb', '#f59e0b'],
  History:     ['#f5f3ff', '#8b5cf6'],
  Geography:   ['#ecfdf5', '#10b981'],
  Environment: ['#f0fdf4', '#22c55e'],
  Science:     ['#eff6ff', '#3b82f6'],
  Ethics:      ['#fdf2f8', '#ec4899'],
}

export default function TaskCard({ task, index }) {
  const { subject, description, duration_minutes, category, topic } = task
  const catCfg = CATEGORY_CONFIG[category] ?? { label: category?.toUpperCase(), className: 'tag--default' }
  const icon = SUBJECT_ICONS[subject] ?? '📚'
  const [bgColor, accentColor] = SUBJECT_BG[subject] ?? ['#f8f9fc', '#6366f1']

  const staggerClass = `stagger-${Math.min(index + 1, 6)}`

  return (
    <div className={`task-card animate-fade-in-up ${staggerClass}`}>
      <div className="task-card-accent-bar" style={{ backgroundColor: accentColor }} />
      <div className="task-card-inner">
        {/* Header */}
        <div className="task-card-header">
          <div className="task-subject-badge" style={{ backgroundColor: bgColor, color: accentColor }}>
            <span className="task-subject-icon">{icon}</span>
            <span className="task-subject-name">{subject}</span>
          </div>
          <span className={`task-tag ${catCfg.className}`}>{catCfg.label}</span>
        </div>

        {/* Content */}
        <div className="task-card-body">
          <h3 className="task-topic">{topic}</h3>
          <p className="task-description">{description}</p>
        </div>

        {/* Footer */}
        <div className="task-card-footer">
          <div className="task-duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration_minutes} minutes
          </div>
          <div className="task-card-actions">
            <button className="task-btn-mark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
