import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaEnvelope, FaUsers, FaFileAlt, FaCogs, FaSignOutAlt, FaLayerGroup } from 'react-icons/fa';

const Sidebar = ({ onLogout, darkMode, setDarkMode }) => {
  const location = useLocation();
  const navItems = [
    { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/emails', icon: <FaEnvelope />, label: 'Emails' },
    { to: '/groups', icon: <FaUsers />, label: 'Groups' },
    { to: '/templates', icon: <FaLayerGroup />, label: 'Templates' },
    { to: '/files', icon: <FaFileAlt />, label: 'Files' },
    { to: '/settings', icon: <FaCogs />, label: 'Settings' },
  ];
  return (
    <div className={`sidebar p-3 vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`} style={{ minWidth: 220 }}>
      <h4 className="mb-4">Gojob</h4>
      <ul className="nav flex-column">
        {navItems.map(item => (
          <li className="nav-item mb-2" key={item.to}>
            <Link
              className={`nav-link d-flex align-items-center${location.pathname === item.to ? ' active fw-bold' : ''} ${darkMode ? 'text-light' : ''}`}
              to={item.to}
            >
              <span className="me-2">{item.icon}</span> {item.label}
            </Link>
          </li>
        ))}
        <li className="nav-item mt-4">
          <button className="btn btn-outline-danger w-100 d-flex align-items-center" onClick={onLogout}>
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;