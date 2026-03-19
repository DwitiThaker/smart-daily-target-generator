import './Topbar.css'

export default function Topbar({ student, studyHours, onStudyHoursChange, onGenerate, loading, showPlanControls = true }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="topbar-brand-text">
          <span className="topbar-title">AI Study Planner</span>
          <span className="topbar-subtitle">UPSC · Smart Planning</span>
        </div>
      </div>

      {showPlanControls && (
        <div className="topbar-controls">
          {/* Active student chip */}
          {student ? (
            <div className="topbar-student-chip">
              <div className="topbar-student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-student-info">
                <span className="topbar-student-name">{student.name}</span>
                <span className="topbar-student-meta">Active Student</span>
              </div>
            </div>
          ) : (
            <div className="topbar-no-student">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              No student loaded — go to Students tab
            </div>
          )}

          {/* Study hours */}
          <div className="topbar-input-group">
            <label className="topbar-label">Study Hours</label>
            <input
              id="study-hours-input"
              className="topbar-input topbar-input--narrow"
              type="number"
              min="1"
              max="16"
              step="0.5"
              placeholder="6"
              value={studyHours}
              onChange={e => onStudyHoursChange(Number(e.target.value))}
            />
          </div>

          <button
            id="generate-plan-btn"
            className={`topbar-btn${loading ? ' topbar-btn--loading' : ''}`}
            onClick={onGenerate}
            disabled={loading || !student}
          >
            {loading ? (
              <>
                <span className="topbar-btn-spinner" />
                Generating…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Generate Plan
              </>
            )}
          </button>
        </div>
      )}
    </header>
  )
}
