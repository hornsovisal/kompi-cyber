import './Announcements.css'

export default function Announcements() {
  const announcements = [
    { tag: 'EVENT', title: 'Tech Conference 2026', description: 'Join industry experts and innovators.' },
    { tag: 'PROGRAM', title: 'New AI Program Launch', description: 'Applications are now open.' },
    { tag: 'SPEAKER', title: 'Guest Lecture Series', description: 'Learn from top professionals.' }
  ]

  return (
    <section className="announcements">
      <h2 className="section-title">Latest Announcements</h2>
      <p className="section-subtitle">Stay updated with CADT news and events</p>
      <div className="announcement-grid">
        {announcements.map((ann, index) => (
          <div key={index} className="announcement-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <span className="tag">{ann.tag}</span>
            <h3>{ann.title}</h3>
            <p>{ann.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
