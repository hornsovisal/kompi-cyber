import { useNavigate } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate()

  const handleStartLearning = () => {
    navigate('/my-learning')
  }

  return (
    <section className="hero">
      <div className="hero-text">
        <h1>
          Empowering <br />
          Future <span>Cybersecurity</span><br />
          Leaders
        </h1>
        <p>
          Track your learning, earn certifications, and build your future with CADT.
        </p>
        <div className="buttons">
          <button className="btn-primary" onClick={handleStartLearning}>Start Learning →</button>
          <button className="btn-outline">Browse Courses</button>
        </div>
      </div>
      <div className="hero-image">
        <div className="placeholder">Hero Image</div>
      </div>
    </section>
  )
}
