const API_BASE_URL = "http://localhost:9090";

class ApiService {
  // Generic GET request
  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any auth headers if needed
          // 'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API GET Error:", error);
      throw error;
    }
  }

  // Generic POST request
  static async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any auth headers if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API POST Error:", error);
      throw error;
    }
  }

  // Example specific API methods
  static async login(credentials) {
    return await this.post("/auth/login", credentials);
  }

  static async getPaperDashboard() {
    return await this.get("/api/paper-dashboard");
  }
}

export default ApiService;
