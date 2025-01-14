import React, { useState, useEffect } from "react";
import NavigationPaper from "../navbar/NavbarPaper";
import axios from "axios";
import "./millMaster.css";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";

const API_BASE_URL = API_ENDPOINTS.MILL;

const MillMasterForm = ({ onSave, editingMill, setAlert }) => {
  const [formData, setFormData] = useState({
    mill_name: "",
    mill_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeForm = async () => {
      if (editingMill) {
        setFormData({
          mill_name: editingMill.mill_name,
          mill_id: editingMill.mill_id,
        });
      } else {
        try {
          const response = await axios.get(`${API_BASE_URL}?next-id`);
          setFormData((prev) => ({
            ...prev,
            mill_id: response.data,
          }));
        } catch (error) {
          console.error("Error fetching next mill ID:", error);
          setAlert({ type: "error", message: "Failed to fetch next Mill ID" });
        }
      }
    };

    initializeForm();
  }, [editingMill, setAlert]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === "mill_name") {
      if (!value.trim() || value.length < 2) {
        newErrors.mill_name = "Mill name must be at least 2 characters long";
      } else {
        delete newErrors.mill_name;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSave = async () => {
    if (!validateField("mill_name", formData.mill_name)) {
      return;
    }

    try {
      setIsLoading(true);

      if (editingMill) {
        await axios.put(`${API_BASE_URL}/${formData.mill_id}`, {
          mill_name: formData.mill_name,
        });
      } else {
        await axios.post(API_BASE_URL, {
          mill_name: formData.mill_name,
        });
      }

      onSave();

      if (!editingMill) {
        const nextIdResponse = await axios.get(`${API_BASE_URL}?next-id`);
        setFormData({
          mill_name: "",
          mill_id: nextIdResponse.data,
        });
      }

      setAlert({
        type: "success",
        message: `Mill ${editingMill ? "updated" : "created"} successfully!`,
      });
    } catch (error) {
      console.error("Error saving mill:", error);
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Failed to save mill",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}?next-id`);
      setFormData({
        mill_name: "",
        mill_id: response.data,
      });
      setErrors({});
    } catch (error) {
      console.error("Error fetching next mill ID:", error);
      setAlert({ type: "error", message: "Failed to fetch next Mill ID" });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto mt-16 paper-box-mill shade-form-card">
      <h2 className="text-2xl font-bold text-gray-800 heading-paper-master-mill card-header-mill">
        {editingMill ? "Update Mill" : "Add Mill Master"}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold text-gray-700 input-fiel-name-mill">
            Mill Name
          </label>
          <input
            type="text"
            name="mill_name"
            value={formData.mill_name}
            onChange={handleInputChange}
            className={`border rounded px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.mill_name ? "border-red-500" : ""
            }`}
            placeholder="Enter mill name"
          />
        </div>
        {errors.mill_name && (
          <div className="text-red-500 text-sm ml-34">{errors.mill_name}</div>
        )}

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold text-gray-700 input-fiel-name-paper2">
            Mill ID
          </label>
          <input
            type="text"
            value={formData.mill_id}
            disabled
            className="border rounded px-3 py-2 w-32 bg-gray-100 text-gray-600"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 button-cancel-mill"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0 || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 button-save-mill"
          >
            {isLoading ? "Saving..." : editingMill ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MillList = ({ mills, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter mills based on search
  const filteredMills = mills.filter((mill) =>
    mill.mill_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMills.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-8 filter-search-container">
      <div className="mb-4 flex gap-4 search-container relative">
        <input
          type="text"
          placeholder="Search by Mill Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 pl-8"
        />
        <span className="absolute left-2.5 top-2.5">🔍</span>
      </div>

      <div className="bg-white rounded-lg shadow table-paper flex justify-between">
        <div className="flex-1">
          <table className="min-w-full table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill">
                  Mill Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill">
                  Mill ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((mill) => (
                <tr key={mill.mill_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {mill.mill_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {mill.mill_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap actions">
                    <button
                      onClick={() => onUpdate(mill)}
                      className="text-blue-600 hover:text-blue-900 mr-4 btn-update"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => onDelete(mill.mill_id)}
                      className="text-red-600 hover:text-red-900 btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div
            className="flex items-center justify-between px-6 py-3 bg-gray-50"
            style={{ height: "30px" }}
          >
            <div className="flex items-center"></div>
            <div
              className="flex items-center space-x-4"
              style={{ marginLeft: "13rem" }}
            >
              {/* Previous Button */}
              <button
                style={{ width: "50px", height: "30px" }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
              >
                <span className="material-icons">chevron_left</span>
              </button>

              {/* Page Info */}
              <div
                className="text-sm text-gray-700 text-center"
                style={{ width: "180px" }}
              >
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </div>

              {/* Next Button */}
              <button
                style={{ width: "50px", height: "30px" }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MillMasterPage = () => {
  const [mills, setMills] = useState([]);
  const [editingMill, setEditingMill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchMills = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setMills(response.data);
    } catch (error) {
      console.error("Error fetching mills:", error);
      setAlert({ type: "error", message: "Failed to fetch mills" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMills();
  }, []);

  const handleDelete = async (millId) => {
    if (window.confirm("Are you sure you want to delete this mill?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${millId}`);
        await fetchMills();
        setAlert({ type: "success", message: "Mill deleted successfully!" });
      } catch (error) {
        console.error("Error deleting mill:", error);
        setAlert({
          type: "error",
          message: error.response?.data?.error || "Failed to delete mill",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <NavigationPaper />
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="p-4 pt-20 min-h-screen bg-gray-50">
        <MillMasterForm
          onSave={fetchMills}
          editingMill={editingMill}
          setAlert={setAlert}
        />
        <MillList
          mills={mills}
          onUpdate={setEditingMill}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
};

export default MillMasterPage;
