import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import "./ProfileDropdown.css";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userName = user.fullName || user.full_name || user.email || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        title={userName}
      >
        <User size={20} />
        <span className="profile-name" title={userName}>
          {userName}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="menu-header">
            <div className="user-info">
              <div className="user-icon">
                <User size={24} />
              </div>
              <div>
                <p className="user-name">{userName}</p>
                <p className="user-email">{user.email || ""}</p>
              </div>
            </div>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-items">
            <button className="menu-item" onClick={handleProfileClick}>
              <Settings size={18} />
              <span>My Profile</span>
            </button>
            <button className="menu-item logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
