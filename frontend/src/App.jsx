import { useState, useEffect } from 'react'
import './App.css'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import TaskCard from './components/TaskCard'
import FocusSummary from './components/FocusSummary'
import LoadingSpinner from './components/LoadingSpinner'
import StudentManager from './components/StudentManager'
import LogAttempt from './components/LogAttempt'
import WeakTopics from './components/WeakTopics'
import { generatePlan, getStudent } from './api'

const NAV_ITEMS = [
  {
    id: 'plan',
    label: 'Study Plan',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/>
      </svg>
    ),
  },
  {
    id: 'students',
    label: 'Students',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'attempts',
    label: 'Log Attempt',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    id: 'weak-topics',
    label: 'Weak Topics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('plan')

  // Shared student state (carried across tabs)
  const [studentId, setStudentId] = useState('')
  const [studyHours, setStudyHours] = useState(6)
  const [plan, setPlan] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initLoading, setInitLoading] = useState(true)

  // ── Auto-load student from localStorage on app start ──
  useEffect(() => {
    const storedId = localStorage.getItem('student_id')
    if (storedId) {
      setInitLoading(true)
      getStudent(storedId)
        .then(s => {
          setStudent(s)
          setStudentId(s.id)
          setStudyHours(s.study_hours_per_day ?? 6)
        })
        .catch(() => {
          // Stored ID is stale — clear it
          localStorage.removeItem('student_id')
        })
        .finally(() => setInitLoading(false))
    } else {
      setInitLoading(false)
    }
  }, [])

  async function handleGenerate() {
    if (!studentId.trim()) return
    setLoading(true)
    setError(null)

    try {
      const [planResult, studentResult] = await Promise.allSettled([
        generatePlan(studentId.trim(), studyHours),
        getStudent(studentId.trim()),
      ])
      if (planResult.status === 'fulfilled') {
        setPlan(planResult.value)
      } else {
        throw new Error(planResult.reason?.message || 'Failed to generate plan')
      }
      if (studentResult.status === 'fulfilled') {
        setStudent(studentResult.value)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // When a student is created/loaded in StudentManager, sync state + localStorage
  function handleStudentLoaded(s) {
    setStudent(s)
    setStudentId(s.id)
    setStudyHours(s.study_hours_per_day ?? studyHours)
    localStorage.setItem('student_id', s.id)
  }

  const tasks = plan?.daily_plan ?? []

  if (initLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="app-root">
      {/* Top nav */}
      <Topbar
        student={student}
        studyHours={studyHours}
        onStudyHoursChange={setStudyHours}
        onGenerate={handleGenerate}
        loading={loading}
        showPlanControls={activeTab === 'plan'}
      />

      <div className="app-body">
        {/* Left: sidebar nav */}
        <div className="app-nav">
          <nav className="side-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`side-nav-item${activeTab === item.id ? ' side-nav-item--active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="side-nav-icon">{item.icon}</span>
                <span className="side-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Study plan sidebar shown only on plan tab */}
          {activeTab === 'plan' && <Sidebar student={student} plan={plan} />}
        </div>

        {/* Main content area */}
        <main className="main-content">
          {/* ── STUDY PLAN TAB ── */}
          {activeTab === 'plan' && (
            <>
              {error && (
                <div className="error-banner animate-fade-in">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                  <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
                </div>
              )}

              {!loading && !plan && !error && (
                <div className="empty-state animate-fade-in-up">
                  <div className="empty-state-illustration">
                    <div className="empty-state-icon-ring">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                        <path d="M2 17L12 22L22 17"/>
                        <path d="M2 12L12 17L22 12"/>
                      </svg>
                    </div>
                    <h2 className="empty-state-title">Ready to plan your day?</h2>
                    <p className="empty-state-desc">
                      {studentId
                        ? <>Student <strong>{student?.name ?? studentId}</strong> is loaded. Click <strong>Generate Plan</strong> above to get your personalized schedule.</>
                        : <>Go to <strong>Students</strong> to create or load a student, then click <strong>Generate Plan</strong> for a personalized AI-powered study schedule.</>
                      }
                    </p>

                    {/* How it works */}
                    <div className="how-it-works">
                      <h3 className="how-it-works-title">How it works</h3>
                      <ol className="how-it-works-steps">
                        <li className="how-step">
                          <div>
                            <p className="how-step-title">Create a student profile</p>
                            <p className="how-step-desc">Go to the <strong>Students</strong> tab and fill in your name, daily hours, and subjects.</p>
                          </div>
                        </li>
                        <li className="how-step">
                          <div>
                            <p className="how-step-title">Log practice attempts</p>
                            <p className="how-step-desc">Use <strong>Log Attempt</strong> to record which questions you got right or wrong.</p>
                          </div>
                        </li>
                        <li className="how-step">
                          <div>
                            <p className="how-step-title">View detected weak topics</p>
                            <p className="how-step-desc">The <strong>Weak Topics</strong> tab shows where you need the most revision.</p>
                          </div>
                        </li>
                        <li className="how-step">
                          <div>
                            <p className="how-step-title">Generate your AI study plan</p>
                            <p className="how-step-desc">Click <strong>Generate Plan</strong> above for a smart, prioritised daily schedule.</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="empty-state-features">
                      <div className="empty-feature">
                        <span className="empty-feature-icon">🎯</span>
                        <div>
                          <p className="empty-feature-title">Weak Topic Prioritization</p>
                          <p className="empty-feature-desc">Focuses on your weakest areas first</p>
                        </div>
                      </div>
                      <div className="empty-feature">
                        <span className="empty-feature-icon">⚡</span>
                        <div>
                          <p className="empty-feature-title">Smart Time Allocation</p>
                          <p className="empty-feature-desc">Optimally distributes your study hours</p>
                        </div>
                      </div>
                      <div className="empty-feature">
                        <span className="empty-feature-icon">📈</span>
                        <div>
                          <p className="empty-feature-title">Progress Tracking</p>
                          <p className="empty-feature-desc">Tracks your subject-wise improvement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading && <LoadingSpinner />}

              {!loading && plan && (
                <div className="plan-view animate-fade-in">
                  <FocusSummary plan={plan} studentName={student?.name} />
                  <div className="plan-header">
                    <div className="plan-header-left">
                      <h1 className="plan-title">Today's Study Plan</h1>
                      <p className="plan-date">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="plan-header-right">
                      <button className="plan-regenerate-btn" onClick={handleGenerate}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10"/>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        Regenerate
                      </button>
                    </div>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="no-tasks">No tasks generated. Try adjusting your study hours.</p>
                  ) : (
                    <div className="task-grid">
                      {tasks.map((task, i) => <TaskCard key={i} task={task} index={i} />)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === 'students' && (
            <StudentManager onStudentLoaded={handleStudentLoaded} onNavigate={setActiveTab} />
          )}

          {/* ── LOG ATTEMPT TAB ── */}
          {activeTab === 'attempts' && (
            <LogAttempt student={student} />
          )}

          {/* ── WEAK TOPICS TAB ── */}
          {activeTab === 'weak-topics' && (
            <WeakTopics student={student} />
          )}
        </main>
      </div>
    </div>
  )
}