import React, { useState, useEffect } from "react";
import { ShadeMasterService } from "./ShadeMasterService";
// import NavigationPaper from "../navbar/NavbarPaper";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
import Alert from "../Alert/Alert";
import "./ShadeMaster.css";

const ShadeForm = ({ onSave, lastShadeId, editingShade }) => {
  const [formData, setFormData] = useState({
    shadeName: "",
    shadeId: (lastShadeId + 1).toString(),
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingShade) {
      setFormData({
        shadeName: editingShade.shadeName,
        shadeId: editingShade.shadeId,
      });
    } else {
      // Calculate next ID, ensuring it's at least 1
      const nextId = Math.max(lastShadeId + 1, 1);
      setFormData({
        shadeName: "",
        shadeId: nextId.toString(),
      });
    }
  }, [editingShade, lastShadeId]);
  
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "shadeName" && !value.trim()) {
      newErrors[name] = "Shade Name is required";
    } else {
      delete newErrors[name];
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
    const isValid = validateField("shadeName", formData.shadeName);

    if (isValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Call onSave and pass the formData to the parent component
        // The parent component will handle the API call
        await onSave(formData);
        
        if (!editingShade) {
          // Only reset form for new entries
          setFormData({
            shadeName: "",
            shadeId: (parseInt(formData.shadeId) + 1).toString(),
          });
        }
        // Alert will be handled by parent component
      } catch (error) {
        setAlert({
          type: "error",
          message: "Error saving shade: " + (error.response?.data?.message || error.message),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      shadeName: "",
      shadeId: (lastShadeId + 1).toString(),
    });
    setErrors({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto mt-16 paper-box-mill shade-form-card">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <h2 className="text-2xl font-bold text-gray-800 heading-paper-master-mill card-header-mill">
        {editingShade ? "Update Shade" : "Add Shade Master"}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold text-gray-700 input-fiel-name-paper1">
            Shade Name
          </label>
          <input
            type="text"
            name="shadeName"
            value={formData.shadeName}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter shade name"
          />
          {errors.shadeName && (
            <span className="text-red-500 text-sm">{errors.shadeName}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold text-gray-700 input-fiel-name-paper2">
            Shade ID
          </label>
          <input
            type="text"
            value={formData.shadeId}
            disabled
            className="border rounded px-3 py-2 w-32 bg-gray-100 text-gray-600"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 button-cancel-mill"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 button-save-mill"
          >
            {isSubmitting ? "Saving..." : (editingShade ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShadeList = ({ shades, onUpdate, onDelete }) => {
  const safeShades = Array.isArray(shades) ? shades : [];
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 15;

  // Sorting and filtering function
  const processShades = () => {
    // Filter by both name and ID
    let processedShades = safeShades.filter((shade) =>
      shade.shadeName.toLowerCase().includes(searchName.toLowerCase()) &&
      shade.shadeId.toString().includes(searchId)
    );

    // Then sort if a column is selected
    if (sortColumn) {
      processedShades.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Handle numeric sorting for shadeId
        if (sortColumn === 'shadeId') {
          valueA = parseInt(valueA, 10);
          valueB = parseInt(valueB, 10);
        } 
        // Handle string comparison for shadeName
        else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedShades;
  };

  // Apply sorting and pagination
  const filteredShades = processShades();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredShades.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredShades.length / itemsPerPage);

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
            placeholder="Search by Shade Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* <span className="absolute left-2.5 top-2.5">🔍</span> */}
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Shade ID"
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
                  onClick={() => handleSort('shadeName')}
                >
                  Shade Name 
                  <SortIcon column="shadeName" />
                </th>
                <th 
                  className="px-6 py-3 w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill cursor-pointer"
                  onClick={() => handleSort('shadeId')}
                >
                  Shade ID 
                  <SortIcon column="shadeId" />
                </th>
                <th className="px-6 py-3 w-1/4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider th-mill">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((shade) => (
                <tr key={shade.shadeId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shade.shadeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shade.shadeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap actions">
                    <button
                      onClick={() => onUpdate(shade)}
                      className="text-blue-600 hover:text-blue-900 mr-4 btn-update"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => onDelete(shade.shadeId)}
                      className="text-red-600 hover:text-red-900 btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls - Unchanged from previous version */}
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

const ShadeMasterPage = () => {
  const [shades, setShades] = useState([]);
  const [editingShade, setEditingShade] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchShades = async () => {
    try {
      const fetchedShades = await ShadeMasterService.getAllShades();
      // Ensure we're setting an array
      if (Array.isArray(fetchedShades)) {
        setShades(fetchedShades);
      } else if (fetchedShades && typeof fetchedShades === 'object') {
        // If it's an object but not an array, convert it
        setShades(Object.values(fetchedShades));
      } else {
        // If neither, set empty array
        setShades([]);
        console.error('Unexpected data format:', fetchedShades);
      }
    } catch (error) {
      setShades([]); // Set empty array on error
      setAlert({
        type: "error",
        message: "Error fetching shades: " + error.message,
      });
      console.error("Error fetching shades:", error);
    }
  };
  
  useEffect(() => {
    fetchShades();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingShade) {
        await ShadeMasterService.updateShade(formData.shadeId, formData);
      } else {
        // Make sure API_BASE_URL ends with a slash for the create operation
        await ShadeMasterService.createShade(formData);
      }
      
      // Fetch fresh data from the backend after save
      await fetchShades();
      setEditingShade(null);
      
      setAlert({
        type: "success",
        message: editingShade ? "Shade updated successfully!" : "Shade saved successfully!"
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error ${editingShade ? 'updating' : 'saving'} shade: ${error.message}`
      });
      throw error; // Re-throw to let ShadeForm component handle UI state
    }
  };

  const handleUpdate = (shade) => {
    setEditingShade(shade);
  };

  const handleDelete = async (shadeId) => {
    if (window.confirm("Are you sure you want to delete this shade?")) {
      try {
        await ShadeMasterService.deleteShade(shadeId);
        // Fetch fresh data after deletion
        await fetchShades();
        setAlert({ type: "success", message: "Shade deleted successfully!" });
      } catch (error) {
        setAlert({
          type: "error",
          message: "Error deleting shade: " + error.message,
        });
      }
    }
  };

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
        <div className="form-section">
          <ShadeForm
            onSave={handleSave}
            lastShadeId={Math.max(
              ...shades.map((s) => parseInt(s.shadeId) || 0),
              0
            )}
            editingShade={editingShade}
          />
        </div>

        <div className="table-section">
          <ShadeList
            shades={shades}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default ShadeMasterPage;
