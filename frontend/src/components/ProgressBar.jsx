import './ProgressBar.css'

const SUBJECT_ICONS = {
  Polity:      '⚖️',
  Economy:     '📈',
  History:     '🏛️',
  Geography:   '🗺️',
  Environment: '🌿',
  Science:     '🔬',
  Ethics:      '🧭',
}

const SUBJECT_COLORS = {
  Polity:      '#6366f1',
  Economy:     '#f59e0b',
  History:     '#8b5cf6',
  Geography:   '#10b981',
  Environment: '#22c55e',
  Science:     '#3b82f6',
  Ethics:      '#ec4899',
}

export default function ProgressBar({ subject, progress }) {
  const pct = Math.round((progress ?? 0) * 100)
  const icon = SUBJECT_ICONS[subject] ?? '📚'
  const color = SUBJECT_COLORS[subject] ?? '#6366f1'

  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-icon">{icon}</span>
        <span className="progress-subject">{subject}</span>
        <span className="progress-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            '--target-width': `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
