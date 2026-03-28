import './Courses.css'

export default function Courses() {
  const courses = [
    {
      provider: 'Google',
      title: 'Cybersecurity Fundamentals',
      rating: '4.8',
      enrolled: '2,450'
    },
    {
      provider: 'IBM',
      title: 'Data Science & Analytics',
      rating: '4.9',
      enrolled: '3,120'
    },
    {
      provider: 'AWS',
      title: 'Cloud Computing Essentials',
      rating: '4.7',
      enrolled: '1,890'
    }
  ]

  return (
    <section className="courses">
      <h2 className="section-title">Featured Courses</h2>
      <p className="section-subtitle">
        Explore industry-recognized programs designed to advance your career
      </p>
      <div className="course-grid">
        {courses.map((course, index) => (
          <div key={index} className="course-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="course-image-placeholder">Course Image</div>
            <div className="course-content">
              <h4>{course.provider}</h4>
              <h3>{course.title}</h3>
              <p className="course-info">⭐ {course.rating} • {course.enrolled} enrolled</p>
              <button className="enroll-btn">Enroll Now →</button>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all">
        <button>View All Courses →</button>
      </div>
    </section>
  )
}
