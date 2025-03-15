import React, { useState, useEffect, useMemo } from "react";
// import NavigationPaper from "../navbar/NavbarPaper";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
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
    <div className="form-container form-height">
      <div className="form-header">
        {editingMill ? "Update Mill" : "Add Mill Master"}
      </div>
      <div className="form-content">
        <div className="form-group">
          <label>Mill Name</label>
          <input
            type="text"
            name="mill_name"
            value={formData.mill_name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter mill name"
          />
        </div>
        {errors.mill_name && (
          <div className="error-text">{errors.mill_name}</div>
        )}

        <div className="form-group">
          <label>Mill ID</label>
          <input
            type="text"
            value={formData.mill_id}
            disabled
            className="form-input disabled"
          />
        </div>

        <div className="button-container">
          <button onClick={handleCancel} className="btn-cancel">
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0 || isLoading}
            className="btn-save"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};


const MillList = ({ mills, onUpdate, onDelete }) => {
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 15;

  // Sorting and filtering function
  const processMills = () => {
    // Filter by both name and ID
    let processedMills = mills.filter((mill) =>
      mill.mill_name.toLowerCase().includes(searchName.toLowerCase()) &&
      mill.mill_id.toLowerCase().includes(searchId.toLowerCase())
    );

    // Then sort if a column is selected
    if (sortColumn) {
      processedMills.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Handle string comparison and custom mill_id sorting
        if (sortColumn === 'mill_id') {
          const extractNumber = (millId) => {
            const match = millId.match(/MILL(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          valueA = extractNumber(valueA);
          valueB = extractNumber(valueB);
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedMills;
  };

  // Apply sorting and pagination
  const filteredMills = processMills();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMills.length / itemsPerPage);

  // Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      // If already sorting this column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If new column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Sorting icon component
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return (
        <span className="ml-2 text-gray-300">
          ↕️
        </span>
      );
    }
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div className="mt-8 filter-search-container">
      <div className="mb-4 flex gap-4 search-container">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Mill Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* <span className="absolute left-2.5 top-2.5">🔍</span> */}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Mill ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* <span className="absolute left-2.5 top-2.5">🔍</span> */}
        </div>
      </div>


      <div className="table-container">
        <div className="table-wrapper">
          <table className="shade-table">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  className="px-6 py-3 w-1/2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill cursor-pointer"
                  onClick={() => handleSort('mill_name')}
                >
                  Mill Name 
                  <SortIcon column="mill_name" />
                </th>
                <th 
                  className="px-6 py-3 w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill cursor-pointer"
                  onClick={() => handleSort('mill_id')}
                >
                  Mill ID 
                  <SortIcon column="mill_id" />
                </th>
                <th className="px-6 py-3 w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill">
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

          <div
            className="flex items-center justify-between px-6 py-3 bg-gray-50"
            style={{ height: "30px" }}
          >
            <div className="flex items-center"></div>
            <div
              className="flex items-center space-x-4"
              style={{ marginLeft: "13rem" }}
            >
              <button
                style={{ width: "50px", height: "30px" }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
              >
                <span className="material-icons">chevron_left</span>
              </button>

              <div
                className="text-sm text-gray-700 text-center"
                style={{ width: "180px" }}
              >
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </div>

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
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  return (
    <>
      <NavigationPaperDashboard />
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="shade-master-container">
        <div className="content-layout">
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
      </div>
    </>
  );
};

export default MillMasterPage;
