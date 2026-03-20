import { useState, useEffect } from 'react'
import './WeakTopics.css'
import { getWeakTopics } from '../api'

function WeakRow({ item, index }) {
  const accuracy = item.total_attempts > 0
    ? Math.round(((item.total_attempts - item.incorrect_count) / item.total_attempts) * 100)
    : 0

  return (
    <div className={`wt-row animate-fade-in-up stagger-${Math.min(index + 1, 6)}${item.weak ? ' wt-row--weak' : ''}`}>
      <div className="wt-row-left">
        <div className={`wt-weakness-dot${item.weak ? ' wt-weakness-dot--weak' : ' wt-weakness-dot--ok'}`} />
        <div className="wt-row-info">
          <span className="wt-subject">{item.subject}</span>
          <span className="wt-topic">{item.topic}</span>
        </div>
      </div>

      <div className="wt-row-center">
        <div className="wt-acc-track">
          <div
            className={`wt-acc-fill${item.weak ? ' wt-acc-fill--weak' : ' wt-acc-fill--ok'}`}
            style={{ '--target-width': `${accuracy}%` }}
          />
        </div>
        <span className="wt-acc-label">{accuracy}% accuracy</span>
      </div>

      <div className="wt-row-right">
        <div className="wt-attempts">
          <span className="wt-incorrect">{item.incorrect_count} wrong</span>
          <span className="wt-sep">/</span>
          <span className="wt-total">{item.total_attempts} attempts</span>
        </div>
        <span className={`wt-badge${item.weak ? ' wt-badge--weak' : ' wt-badge--ok'}`}>
          {item.weak ? 'WEAK' : 'OK'}
        </span>
      </div>
    </div>
  )
}

export default function WeakTopics({ student, defaultStudentId = '' }) {
  const [studentId, setStudentId] = useState(defaultStudentId)
  const [topics, setTopics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  // ✅ AUTO-FILL FROM APP (KEY FIX)
  useEffect(() => {
    if (student?.id) {
      setStudentId(student.id)
    }
  }, [student])

  // ✅ OPTIONAL: AUTO-LOAD WHEN STUDENT AVAILABLE (great for demo)
  useEffect(() => {
    if (student?.id) {
      handleLoad(student.id)
    }
  }, [student])

  async function handleLoad(idOverride) {
    const idToUse = idOverride || studentId

    if (!idToUse.trim()) return
    setLoading(true)
    setError(null)
    setTopics(null)

    try {
      const res = await getWeakTopics(idToUse.trim())
      setTopics(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const weakCount = topics?.filter(t => t.weak).length ?? 0
  const okCount   = topics?.filter(t => !t.weak).length ?? 0

  const filtered = topics
    ? (filter === 'weak'
        ? topics.filter(t => t.weak)
        : filter === 'ok'
        ? topics.filter(t => !t.weak)
        : topics)
    : []

  const grouped = {}
  filtered.forEach(item => {
    if (!grouped[item.subject]) grouped[item.subject] = []
    grouped[item.subject].push(item)
  })

  return (
    <div className="wt-container animate-fade-in-up">
      <div className="wt-header">
        <h1 className="wt-title">Weak Topic Analyzer</h1>
        <p className="wt-subtitle">
          Identifies topics where your performance signals a need for focused revision
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="wt-lookup-card">
        <div className="wt-lookup-row">
          <input
            id="wt-student-id"
            className="wt-input"
            placeholder="Enter Student ID to analyze…"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            // Optional: disable if student already loaded
            disabled={!!student}
          />

          <button
            id="wt-analyze-btn"
            className="wt-analyze-btn"
            onClick={() => handleLoad()}
            disabled={loading || !studentId.trim()}
          >
            {loading ? (
              <>
                <span className="wt-spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>

        {/* ✅ Show loaded student */}
        {student && (
          <p style={{ marginTop: '8px', opacity: 0.7 }}>
            Loaded: <strong>{student.name}</strong>
          </p>
        )}
      </div>

      {error && <div className="wt-error">{error}</div>}

      {topics && (
        <div className="wt-results animate-fade-in">
          <div className="wt-summary-row">
            <div className="wt-summary-chip wt-summary-chip--total">
              <span className="wt-summary-num">{topics.length}</span>
              <span>Total Topics</span>
            </div>
            <div className="wt-summary-chip wt-summary-chip--weak">
              <span className="wt-summary-num">{weakCount}</span>
              <span>Weak Topics</span>
            </div>
            <div className="wt-summary-chip wt-summary-chip--ok">
              <span className="wt-summary-num">{okCount}</span>
              <span>On Track</span>
            </div>
          </div>

          <div className="wt-filter-tabs">
            {['all', 'weak', 'ok'].map(f => (
              <button
                key={f}
                className={`wt-filter-tab${filter === f ? ' wt-filter-tab--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '📋 All' : f === 'weak' ? '🔴 Weak' : '✅ On Track'}
              </button>
            ))}
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="wt-empty">No topics match that filter.</div>
          ) : (
            Object.entries(grouped).map(([subject, items]) => (
              <div key={subject} className="wt-subject-group">
                <h3 className="wt-subject-heading">{subject}</h3>
                <div className="wt-rows">
                  {items.map((item, i) => (
                    <WeakRow key={i} item={item} index={i} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!topics && !loading && !error && (
        <div className="wt-placeholder animate-fade-in">
          <span className="wt-placeholder-icon">🔍</span>
          <p>
            Enter a Student ID and click <strong>Analyze</strong> to see weak topic insights
          </p>
        </div>
      )}
    </div>
  )
}