import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import "./Navbar.css";

export default function Navbar() {
  const [searchActive, setSearchActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <span className="cadt">Kompi-Cyber</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            <li>
              <Link to="/" className={isActive("/")}>
                Home
              </Link>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Courses
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Programs
              </a>
            </li>
            <li>
              <Link to="/my-learning" className={isActive("/my-learning")}>
                My Learning
              </Link>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                About
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="navbar-right">
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
            <ProfileDropdown />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <div className="mobile-profile">
            <ProfileDropdown />
          </div>
          <ul>
            <li>
              <Link to="/" className={isActive("/")} onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                }}
              >
                Courses
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                }}
              >
                Programs
              </a>
            </li>
            <li>
              <Link
                to="/my-learning"
                className={isActive("/my-learning")}
                onClick={closeMobileMenu}
              >
                My Learning
              </Link>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                }}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
