import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './MyLearning.css'

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState('inProgress')
  const [searchQuery, setSearchQuery] = useState('')

  const courses = {
    completed: [
      { id: 1, title: 'Cybersecurity Fundamentals', progress: 100, instructor: 'Google' },
      { id: 2, title: 'Python Basics', progress: 100, instructor: 'Codecademy' }
    ],
    inProgress: [
      { id: 3, title: 'Data Science & Analytics', progress: 65, instructor: 'IBM' },
      { id: 4, title: 'Cloud Computing Essentials', progress: 40, instructor: 'AWS' },
      { id: 5, title: 'Web Development Mastery', progress: 55, instructor: 'Udemy' }
    ]
  }

  const metrics = [
    { label: 'Total Courses', value: '6', icon: 'fa-book' },
    { label: 'Completed', value: '2', icon: 'fa-check' },
    { label: 'Streak', value: '12 Days', icon: 'fa-fire' },
    { label: 'Points', value: '2,450', icon: 'fa-star' }
  ]

  const activeCourses = activeTab === 'completed' ? courses.completed : courses.inProgress
  const filtered = activeCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="my-learning-page">
      <Navbar />

      <div className="my-learning-container">
        <div className="learning-header">
          <h1>My Learning Dashboard</h1>
          <p>Track your progress and continue learning</p>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <i className={`fa-solid ${metric.icon}`}></i>
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="learning-content">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="learning-search"
            />
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'inProgress' ? 'active' : ''}`}
              onClick={() => setActiveTab('inProgress')}
            >
              In Progress
            </button>
            <button
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>

          <div className="courses-list">
            {filtered.map(course => (
              <div key={course.id} className="learning-course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="instructor">{course.instructor}</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{course.progress}%</span>
                </div>
                <button className="continue-btn">
                  {activeTab === 'completed' ? 'Review Course' : 'Continue Learning'} →
                </button>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="no-results">
              <p>No courses found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div className="analytics-section">
          <h2>Learning Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Weekly Goal</h4>
              <p className="analytics-value">18/20 hours</p>
              <div className="mini-bar">
                <div style={{ width: '90%' }}></div>
              </div>
            </div>
            <div className="analytics-card">
              <h4>Accuracy Rate</h4>
              <p className="analytics-value">87%</p>
              <div className="mini-bar">
                <div style={{ width: '87%' }}></div>
              </div>
            </div>
            <div className="analytics-card">
              <h4>Assignments</h4>
              <p className="analytics-value">12/15 Done</p>
              <div className="mini-bar">
                <div style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
