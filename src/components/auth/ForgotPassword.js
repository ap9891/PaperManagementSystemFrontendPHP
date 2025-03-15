import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import API_ENDPOINTS from "../../config/config";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const BASE_URL = API_ENDPOINTS.BASE;

  // Configure axios defaults
  axios.defaults.headers.common["Content-Type"] = "application/json";

  const handleRequestReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    setError("");
    setLoading(true);
    console.log('Attempting password reset with URL:', API_ENDPOINTS.FORGOT_PASSWORD);
    
    try {
      const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        email,
      });
      console.log('Password reset response:', response);
  
      setMessage("If an account exists with this email, a reset link will be sent.");
      setStep(2);
      setError("");
    } catch (err) {
      console.error('Password reset error:', err);
      console.error('Error response:', err.response);
      setError(
        err.response?.data?.error ||
        "An error occurred while processing your request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token) {
      setError("Reset token is required");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // const response = await axios.post(`${BASE_URL}/forgot-password.php`, {
      //   token,
      //   newPassword,
      // });
      const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
        token,
        newPassword,
      });
  

      if (response.data.success) {
        setStep(3);
        setError("");
      } else {
        setError(response.data.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={handleRequestReset}
              disabled={loading}
              className={`w-full p-2 rounded ${
                loading ? "bg-gray-400" : "bg-blue-500 text-white"
              }`}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="text-center">
            <p className="mb-4">{message}</p>
            <p>Please check your email for the reset link.</p>
            <p className="mt-4 text-sm text-gray-600">
              The reset link will expire in 1 hour.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="text-center">
            <h3 className="text-green-600 font-bold mb-4">
              Password Reset Successfully
            </h3>
            <p>You can now log in with your new password.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // This component will be rendered when user clicks the reset link
  const renderResetForm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    if (resetToken) {
      return (
        <div>
          <input
            type="hidden"
            value={resetToken}
            onChange={(e) => setToken(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className={`w-full p-2 rounded ${
              loading ? "bg-gray-400" : "bg-blue-500 text-white"
            }`}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </div>
      );
    }

    return renderStep();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            {error}
          </div>
        )}
        {renderResetForm()}
      </div>
    </div>
  );
};

export default ForgotPassword;
