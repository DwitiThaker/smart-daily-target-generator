import { useState } from 'react'
import './LogAttempt.css'
import { createAttempt } from '../api'

const FALLBACK_SUBJECTS = ['Polity', 'Economy', 'History', 'Geography', 'Environment', 'Science', 'Ethics']

const SAMPLE_ATTEMPTS = [
  { subject: 'Environment', topic: 'Biodiversity', is_correct: false },
  { subject: 'Environment', topic: 'Biodiversity', is_correct: false },
  { subject: 'Environment', topic: 'Biodiversity', is_correct: false },
  { subject: 'Geography',   topic: 'Rivers',       is_correct: false },
  { subject: 'Geography',   topic: 'Rivers',       is_correct: false },
  { subject: 'Geography',   topic: 'Rivers',       is_correct: false },
  { subject: 'Polity',      topic: 'Parliament',   is_correct: true  },
]

export default function LogAttempt({ student }) {
  const studentId = student?.id ?? ''
  const subjectOptions = student?.subjects_progress
    ? Object.keys(student.subjects_progress)
    : FALLBACK_SUBJECTS

  const [form, setForm] = useState({
    subject: '',
    topic: '',
    is_correct: true,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  // Sample data state
  const [sampleLoading, setSampleLoading] = useState(false)
  const [sampleProgress, setSampleProgress] = useState(null) // null | { done, total }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!studentId) { setError('No student loaded. Please create or load a student first.'); return }
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await createAttempt({ ...form, student_id: studentId })
      setResult(res)
      setHistory(h => [res, ...h].slice(0, 10))
      setForm(f => ({ ...f, topic: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadSample() {
    if (!studentId) { setError('No student loaded. Please create or load a student first.'); return }
    setSampleLoading(true)
    setSampleProgress({ done: 0, total: SAMPLE_ATTEMPTS.length })
    setError(null)
    let done = 0
    const logged = []
    for (const attempt of SAMPLE_ATTEMPTS) {
      try {
        const res = await createAttempt({ ...attempt, student_id: studentId })
        logged.push(res)
      } catch {
        // continue even if one fails
      }
      done++
      setSampleProgress({ done, total: SAMPLE_ATTEMPTS.length })
    }
    setHistory(h => [...logged.reverse(), ...h].slice(0, 10))
    setSampleLoading(false)
    setSampleProgress(null)
  }

  return (
    <div className="la-container animate-fade-in-up">
      <div className="la-header">
        <h1 className="la-title">Log Test Attempt</h1>
        <p className="la-subtitle">Record question attempts to power weak-topic detection and personalized plans</p>
      </div>

      {/* Active student banner */}
      {student ? (
        <div className="la-student-banner">
          <div className="la-student-avatar">{student.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="la-student-name">{student.name}</p>
            <p className="la-student-hint">Attempts will be logged for this student</p>
          </div>
        </div>
      ) : (
        <div className="la-no-student-banner">
          ⚠️ No student loaded — go to the <strong>Students</strong> tab to create or load one.
        </div>
      )}

      <div className="la-layout">
        {/* Form */}
        <div className="la-form-card">

          {/* Load sample data */}
          <div className="la-sample-section">
            <div className="la-sample-info">
              <p className="la-sample-title">Quick Demo</p>
              <p className="la-sample-desc">Load pre-built attempts to instantly see weak topics and generate a study plan.</p>
            </div>
            <button
              id="load-sample-btn"
              className="la-sample-btn"
              onClick={handleLoadSample}
              disabled={sampleLoading || !studentId}
            >
              {sampleLoading
                ? `Logging ${sampleProgress?.done}/${sampleProgress?.total}…`
                : '⚡ Load Sample Attempts'}
            </button>
          </div>

          <div className="la-divider"><span>or log manually</span></div>

          <form onSubmit={handleSubmit} className="la-form">
            <div className="la-field-row">
              <div className="la-field">
                <label className="la-label">Subject</label>
                <select
                  id="la-subject"
                  className="la-input la-select"
                  required
                  value={form.subject}
                  onChange={e => setField('subject', e.target.value)}
                >
                  <option value="">Select subject…</option>
                  {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="la-hint">e.g. Polity, Economy, History, Geography</span>
              </div>

              <div className="la-field">
                <label className="la-label">Topic</label>
                <input
                  id="la-topic"
                  className="la-input"
                  required
                  placeholder="Type a topic…"
                  value={form.topic}
                  onChange={e => setField('topic', e.target.value)}
                />
                <span className="la-hint">e.g. Fundamental Rights, Inflation, Rivers</span>
              </div>
            </div>

            <div className="la-field">
              <label className="la-label">Result</label>
              <div className="la-toggle-row">
                <button
                  type="button"
                  id="la-correct-btn"
                  className={`la-toggle-btn la-toggle-btn--correct${form.is_correct ? ' la-toggle-btn--active-correct' : ''}`}
                  onClick={() => setField('is_correct', true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Correct
                </button>
                <button
                  type="button"
                  id="la-incorrect-btn"
                  className={`la-toggle-btn la-toggle-btn--incorrect${!form.is_correct ? ' la-toggle-btn--active-incorrect' : ''}`}
                  onClick={() => setField('is_correct', false)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Incorrect
                </button>
              </div>
            </div>

            {error && <div className="la-error">{error}</div>}

            {result && (
              <div className="la-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Attempt logged — <strong>{result.subject} · {result.topic}</strong>
                {' '}marked as <strong>{result.is_correct ? '✅ Correct' : '❌ Incorrect'}</strong>
              </div>
            )}

            <button id="log-attempt-btn" type="submit" className="la-submit-btn" disabled={loading || !studentId}>
              {loading ? <><span className="la-spinner" />Logging…</> : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Log Attempt
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right panel: tracked subjects + history */}
        <div className="la-right-panel">
          {/* Tracked subjects */}
          {student?.subjects_progress && (
            <div className="la-tracked-card">
              <h3 className="la-tracked-title">Tracked Subjects</h3>
              <ul className="la-tracked-list">
                {Object.entries(student.subjects_progress).map(([sub, prog]) => (
                  <li key={sub} className="la-tracked-item">
                    <span className="la-tracked-name">{sub}</span>
                    <div className="la-tracked-bar-wrap">
                      <div className="la-tracked-bar" style={{ width: `${Math.round(prog * 100)}%` }} />
                    </div>
                    <span className="la-tracked-pct">{Math.round(prog * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* History */}
          <div className="la-history">
            <h3 className="la-history-title">Recent Logs</h3>
            {history.length === 0 ? (
              <div className="la-history-empty">
                <span>📋</span>
                <p>No attempts logged yet this session</p>
              </div>
            ) : (
              <div className="la-history-list">
                {history.map((item, i) => (
                  <div key={i} className={`la-history-item${item.is_correct ? ' la-history-item--correct' : ' la-history-item--wrong'}`}>
                    <div className="la-history-dot" />
                    <div className="la-history-info">
                      <span className="la-history-subject">{item.subject}</span>
                      <span className="la-history-topic">{item.topic}</span>
                    </div>
                    <span className={`la-history-badge${item.is_correct ? ' la-history-badge--correct' : ' la-history-badge--wrong'}`}>
                      {item.is_correct ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
