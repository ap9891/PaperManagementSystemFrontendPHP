const getApiBaseUrl = () => {
  const env = process.env.REACT_APP_ENV || "development";

  const API_URLS = {
    development: "http://localhost:9090/api",
    production: "https://fantasypackaging.in/api/api",
  };

  return API_URLS[env];
};

export const API_ENDPOINTS = {
  BASE: getApiBaseUrl(),
  FORGOT_PASSWORD: `${getApiBaseUrl()}/forgot-password.php`,
  LOGIN: `${getApiBaseUrl()}/login.php`,
  LOGOUT: `${getApiBaseUrl()}/auth/logout`,
  MILL: `${getApiBaseUrl()}/mill.php`,
  PAPER: `${getApiBaseUrl()}/paper-master`,
  SHADE: `${getApiBaseUrl()}/shades`,
  INVENTORY: {
    SEARCH: `${getApiBaseUrl()}/inventory/search.php`,
  },
  REELS: {
    READ: `${getApiBaseUrl()}/reels/reels.php`,
    HISTORY: `${getApiBaseUrl()}/reels/reels.php/history`,
    SEARCH: `${getApiBaseUrl()}/reels/reels.php`,
    STOCK_OUT: `${getApiBaseUrl()}/reels/reels.php/stock-out`,
  },
  PAPER_PURCHASES: {
    READ: `${getApiBaseUrl()}/paper-purchases/read.php`,
    CREATE: `${getApiBaseUrl()}/paper-purchases/create.php`,
    GENERATE_REEL: `${getApiBaseUrl()}/paper-purchases/generate-reel-number.php`,
  },
};

export default API_ENDPOINTS;
