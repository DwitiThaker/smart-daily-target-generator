import { useState } from 'react'
import './StudentManager.css'
import { createStudent, getStudent, updateStudent } from '../api'

const DEFAULT_SUBJECTS = ['Polity', 'Economy', 'History', 'Geography', 'Environment']

function SubjectProgressEditor({ subjects, onChange }) {
  const addSubject = () => {
    const name = prompt('Subject name:')
    if (name && !subjects[name]) onChange({ ...subjects, [name]: 0 })
  }
  const removeSubject = (key) => {
    const next = { ...subjects }
    delete next[key]
    onChange(next)
  }
  return (
    <div className="subject-editor">
      {Object.entries(subjects).map(([sub, val]) => (
        <div key={sub} className="subject-editor-row">
          <span className="subject-editor-name">{sub}</span>
          <div className="subject-editor-controls">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={val}
              onChange={e => onChange({ ...subjects, [sub]: parseFloat(e.target.value) })}
              className="subject-slider"
            />
            <span className="subject-pct">{Math.round(val * 100)}%</span>
            <button className="subject-remove-btn" onClick={() => removeSubject(sub)} title="Remove">✕</button>
          </div>
        </div>
      ))}
      <button className="subject-add-btn" onClick={addSubject}>+ Add Subject</button>
    </div>
  )
}

export default function StudentManager({ onStudentLoaded, onNavigate }) {
  // ── Create tab ──
  const [createForm, setCreateForm] = useState({
    name: '',
    study_hours_per_day: 6,
    subjects_progress: Object.fromEntries(DEFAULT_SUBJECTS.map(s => [s, 0])),
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createResult, setCreateResult] = useState(null)
  const [createError, setCreateError] = useState(null)

  // ── Lookup / Update tab ──
  const [lookupId, setLookupId] = useState('')
  const [loadedStudent, setLoadedStudent] = useState(null)
  const [updateForm, setUpdateForm] = useState({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const [activeTab, setActiveTab] = useState('create')

  // ── Handlers: Create ──
  async function handleCreate(e) {
    e.preventDefault()
    setCreateLoading(true)
    setCreateResult(null)
    setCreateError(null)
    try {
      const res = await createStudent(createForm)
      setCreateResult(res)
      // Auto-load: push student data & ID up to App immediately
      if (onStudentLoaded) onStudentLoaded(res)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  // ── Handlers: Lookup ──
  async function handleLookup() {
    if (!lookupId.trim()) return
    setLookupLoading(true)
    setLookupError(null)
    setLoadedStudent(null)
    setUpdateSuccess(false)
    try {
      const res = await getStudent(lookupId.trim())
      setLoadedStudent(res)
      setUpdateForm({
        study_hours_per_day: res.study_hours_per_day,
        subjects_progress: { ...res.subjects_progress },
      })
      if (onStudentLoaded) onStudentLoaded(res)
    } catch (err) {
      setLookupError(err.message)
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleUpdate() {
    if (!loadedStudent) return
    setUpdateLoading(true)
    setUpdateSuccess(false)
    try {
      await updateStudent(loadedStudent.id, updateForm)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err) {
      setLookupError(err.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="sm-container animate-fade-in-up">
      <div className="sm-header">
        <h1 className="sm-title">Student Manager</h1>
        <p className="sm-subtitle">Create new students or update their progress and study hours</p>
      </div>

      {/* Tabs */}
      <div className="sm-tabs">
        <button className={`sm-tab${activeTab === 'create' ? ' sm-tab--active' : ''}`} onClick={() => setActiveTab('create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Student
        </button>
        <button className={`sm-tab${activeTab === 'update' ? ' sm-tab--active' : ''}`} onClick={() => setActiveTab('update')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Lookup & Edit
        </button>
      </div>

      {/* ── CREATE ── */}
      {activeTab === 'create' && (
        <div className="sm-panel animate-fade-in">
          <form onSubmit={handleCreate} className="sm-form">
            <div className="sm-field-row">
              <div className="sm-field">
                <label className="sm-label">Full Name</label>
                <input
                  id="create-name"
                  className="sm-input"
                  required
                  placeholder="e.g. Rohit Sharma"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="sm-field sm-field--narrow">
                <label className="sm-label">Study Hours / Day</label>
                <input
                  id="create-hours"
                  className="sm-input"
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  placeholder="6"
                  value={createForm.study_hours_per_day}
                  onChange={e => setCreateForm(f => ({ ...f, study_hours_per_day: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="sm-field">
              <label className="sm-label">Subject Starting Progress</label>
              <SubjectProgressEditor
                subjects={createForm.subjects_progress}
                onChange={sp => setCreateForm(f => ({ ...f, subjects_progress: sp }))}
              />
            </div>

            {createError && <div className="sm-error">{createError}</div>}

            {createResult && (
              <div className="sm-success sm-success--row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span><strong>{createResult.name}</strong> loaded &amp; ready!</span>
                {onNavigate && (
                  <button
                    type="button"
                    className="sm-goto-btn"
                    onClick={() => onNavigate('plan')}
                  >
                    Go to Study Plan →
                  </button>
                )}
              </div>
            )}

            <button id="create-student-btn" type="submit" className="sm-submit-btn" disabled={createLoading}>
              {createLoading ? <><span className="sm-spinner" />Creating…</> : 'Create Student'}
            </button>
          </form>
        </div>
      )}

      {/* ── LOOKUP & EDIT ── */}
      {activeTab === 'update' && (
        <div className="sm-panel animate-fade-in">
          <div className="sm-lookup-row">
            <input
              id="lookup-student-id"
              className="sm-input sm-input--grow"
              placeholder="Paste Student ID to load…"
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
            <button id="lookup-btn" className="sm-lookup-btn" onClick={handleLookup} disabled={lookupLoading}>
              {lookupLoading ? <span className="sm-spinner" /> : 'Load'}
            </button>
          </div>

          {lookupError && <div className="sm-error">{lookupError}</div>}

          {loadedStudent && (
            <div className="sm-loaded animate-fade-in">
              <div className="sm-loaded-header">
                <div className="sm-loaded-avatar">{loadedStudent.name.charAt(0)}</div>
                <div>
                  <p className="sm-loaded-name">{loadedStudent.name}</p>
                  <p className="sm-loaded-id">ID: {loadedStudent.id}</p>
                </div>
              </div>

              <div className="sm-field">
                <label className="sm-label">Study Hours / Day</label>
                <input
                  id="update-hours"
                  className="sm-input sm-input--narrow-fixed"
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={updateForm.study_hours_per_day ?? ''}
                  onChange={e => setUpdateForm(f => ({ ...f, study_hours_per_day: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="sm-field">
                <label className="sm-label">Subject Progress</label>
                <SubjectProgressEditor
                  subjects={updateForm.subjects_progress ?? {}}
                  onChange={sp => setUpdateForm(f => ({ ...f, subjects_progress: sp }))}
                />
              </div>

              {updateSuccess && (
                <div className="sm-success">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Student updated successfully!
                </div>
              )}

              <button id="update-student-btn" className="sm-submit-btn" onClick={handleUpdate} disabled={updateLoading}>
                {updateLoading ? <><span className="sm-spinner" />Saving…</> : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
