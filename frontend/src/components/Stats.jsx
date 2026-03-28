import './Stats.css'

export default function Stats() {
  const stats = [
    { number: '6', label: 'Enrolled Courses' },
    { number: '4', label: 'Completed Certificates' },
    { number: '93.8%', label: 'Learning Progress' },
    { number: '2', label: 'Upcoming Deadlines', highlight: true }
  ]

  return (
    <section className="stats">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <h2 className={stat.highlight ? 'orange' : ''}>{stat.number}</h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
