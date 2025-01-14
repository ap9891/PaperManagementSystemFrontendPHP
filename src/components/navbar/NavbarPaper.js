import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-x-4">
            <Link
              to="/dashboard"
              className={`${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/master"
              className={`${location.pathname === "/master" ? "active" : ""}`}
            >
              Paper Master
            </Link>
            <Link
              to="/mill-master"
              className={`${
                location.pathname === "/mill-master" ? "active" : ""
              }`}
            >
              Mill Master
            </Link>
            <Link
              to="/shade-master"
              className={`${
                location.pathname === "/shade-master" ? "active" : ""
              }`}
            >
              Shade Master
            </Link>
          </div>
          <div>
            <Link to="/logout" className="logout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-12 transition-transform"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
