import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [searchActive, setSearchActive] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className="navbar">
      <div className="logo">
        <span className="cadt">Kompi-Cyber</span>
      </div>

      <nav>
        <ul>
          <li>
            <Link 
              to="/" 
              className={isActive('/')}
            >
              Home
            </Link>
          </li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Courses</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Programs</a></li>
          <li>
            <Link 
              to="/my-learning"
              className={isActive('/my-learning')}
            >
              My Learning
            </Link>
          </li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>About</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li>
        </ul>
      </nav>

      <div className="search-bar">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search..."
          onFocus={() => setSearchActive(true)}
          onBlur={() => setSearchActive(false)}
        />
        <i className="fa-solid fa-search"></i>
      </div>

      <div className="icons">
        <i className="fa-regular fa-bell"></i>
        <i className="fa-regular fa-user"></i>
      </div>
    </header>
  )
}
