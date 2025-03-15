import axios from "axios";
import API_ENDPOINTS from "../../config/config";

const API_BASE_URL = API_ENDPOINTS.SHADE; 

export const ShadeMasterService = {
  getAllShades: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        return Object.values(response.data);
      }
      console.error('Unexpected API response format:', response.data);
      return [];
    } catch (error) {
      console.error("Error fetching shades:", error);
      throw error;
    }
  },

  createShade: async (shadeData) => {
    try {
      // Make sure the URL ends with a trailing slash
      const url = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
      const response = await axios.post(url, shadeData);
      return response.data;
    } catch (error) {
      console.error("Error creating shade:", error);
      throw error;
    }
  },

  updateShade: async (shadeId, shadeData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}?id=${shadeId}`,
        shadeData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating shade:", error);
      throw error;
    }
  },

  deleteShade: async (shadeId) => {
    try {
      await axios.delete(`${API_BASE_URL}?id=${shadeId}`);
    } catch (error) {
      console.error("Error deleting shade:", error);
      throw error;
    }
  },
};
