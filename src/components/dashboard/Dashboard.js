import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../../config/config";
import "./dashboard.css";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    is_admin: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const BASE = API_ENDPOINTS.BASE;

  useEffect(() => {
    // Check for token and admin status
    const token = localStorage.getItem("token");
    const userIsAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token) {
      navigate("/login");
      return;
    }

    setIsAdmin(userIsAdmin);
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      // Ensure is_admin is always a boolean
      const modifiedFormData = {
        ...formData,
        is_admin: Boolean(formData.is_admin), // Convert to boolean
      };

      const response = await fetch(`${BASE}/add-user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modifiedFormData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("User added successfully!");
        setFormData({
          email: "",
          password: "",
          is_admin: false,
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to add user");
      }
    } catch (err) {
      setError("An error occurred while adding the user");
      if (err.message === "Unauthorized") {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  if (
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname === "/forgot-password"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <nav className="navbar">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="icon-container flex items-center">
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="add-user-btn"
                  title="Add User"
                >
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
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </button>
              )}
              <Link
                to="/logout"
                className="logout-dashboard ml-4"
                style={{ marginLeft: "100rem" }}
              >
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

      {isModalOpen && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div>
              <button
                className="close-button"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-header">
              <h2>Add New User</h2>
              {/* <button 
                onClick={() => setIsModalOpen(false)}
                className="close-button"
              >
                ×
              </button> */}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="add-user-form">
              <div className="form-group">
                {/* <label htmlFor="email">Email:</label> */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                {/* <label htmlFor="password">Password:</label> */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group checkbox-group">
                <label style={{ width: "136px" }} htmlFor="is_admin">
                  Grant Admin Rights
                </label>
                <input
                  id="is_admin"
                  name="is_admin"
                  type="checkbox"
                  checked={formData.is_admin}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="date-display">
          <div>
            {currentTime.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
        <h1 className="main-title">Fantasy Packaging Private Limited</h1>
        <div className="buttons-grid">
          <Link to="/paper-raw">Paper Raw Material</Link>
          <Link to="/polythene-raw">Polythene Raw Material</Link>
          <Link to="/disposable-plates">Disposable Plates</Link>
          <Link to="/store">Store</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
