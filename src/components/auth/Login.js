import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";
import "./Login.css";

const BASE_URL = API_ENDPOINTS.LOGIN;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing tokens and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert(null);

    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", data.user.isAdmin);
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: data.user.email,
          isAdmin: data.user.isAdmin,
          loggedInAt: new Date().toISOString(),
        })
      );

      setAlert({
        type: "success",
        message: "Login successful! Redirecting to dashboard...",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setAlert({
        type: "error",
        message: error.message || "Login failed. Please try again.",
      });
    }
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <div className="login-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={handleAlertClose}
          duration={3000}
        />
      )}

      <h2 className="login-title">Login</h2>
      <form onSubmit={handleLogin}>
        <label className="login-label">Email</label>
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="login-label password-button">Password</label>
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <a href="/forgot-password" className="forgot-password">
        Forgot Password?
      </a>
    </div>
  );
};

export default Login;
