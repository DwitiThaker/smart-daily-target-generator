import './LoadingSpinner.css'

export default function LoadingSpinner() {
  return (
    <div className="loading-container animate-fade-in">
      <div className="loading-cards">
        {[1, 2, 3].map(i => (
          <div key={i} className="loading-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="skeleton-row skeleton-row--short" />
            <div className="skeleton-row skeleton-row--long" />
            <div className="skeleton-row skeleton-row--medium" />
          </div>
        ))}
      </div>
      <div className="loading-text-block">
        <div className="loading-spinner-ring" />
        <p className="loading-text">AI is crafting your personalized plan…</p>
      </div>
    </div>
  )
}
