import './FocusSummary.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function FocusSummary({ plan, studentName }) {
  if (!plan) return null

  const tasks = plan.daily_plan ?? []
  const totalMinutes = plan.total_minutes ?? 0
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const weakCount = tasks.filter(t => t.category === 'weak_topic').length
  const newCount  = tasks.filter(t => t.category === 'new_topic').length
  const revCount  = tasks.filter(t => t.category === 'revision').length

  const timeStr = hours > 0
    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    : `${mins}m`

  return (
    <div className="focus-summary animate-fade-in">
      <div className="focus-summary-left">
        <div className="focus-summary-greeting">
          <span className="focus-emoji">☀️</span>
          <span className="focus-greeting-text">
            {getGreeting()}{studentName ? `, ${studentName.split(' ')[0]}` : ''}!
          </span>
        </div>
        <h2 className="focus-headline">
          You have <span className="focus-highlight">{tasks.length} study tasks</span> today
        </h2>
        <p className="focus-sub">
          Estimated study time: <strong>{timeStr}</strong>
        </p>
      </div>

      <div className="focus-summary-chips">
        {weakCount > 0 && (
          <div className="focus-chip focus-chip--red">
            <span className="focus-chip-num">{weakCount}</span>
            <span>Weak Topics</span>
          </div>
        )}
        {newCount > 0 && (
          <div className="focus-chip focus-chip--blue">
            <span className="focus-chip-num">{newCount}</span>
            <span>New Topics</span>
          </div>
        )}
        {revCount > 0 && (
          <div className="focus-chip focus-chip--green">
            <span className="focus-chip-num">{revCount}</span>
            <span>Revisions</span>
          </div>
        )}
      </div>
    </div>
  )
}
