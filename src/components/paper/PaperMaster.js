import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "./paperMaster.css";
// import NavigationPaper from "../navbar/NavbarPaper";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";

const API_BASE_URL = API_ENDPOINTS.PAPER;

const PaperMasterForm = ({
  onSave,
  lastPartNumber,
  initialData,
  isEditing,
  onUpdate,
  onCancel,
}) => {
  const initialFormState = useMemo(
    () => ({
      type: "K",
      reelSize: "",
      gsm: "",
      bf: "",
      partNumber: (lastPartNumber + 1).toString(),
      partName: "",
    }),
    [lastPartNumber]
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };
  useEffect(() => {
    if (isEditing && initialData) {
      // Transform backend data structure to match frontend
      setFormData({
        id: initialData.id,
        type: initialData.type || "K",
        reelSize: initialData.reel_size || "", // Match the backend field name
        gsm: initialData.gsm || "",
        bf: initialData.bf || "",
        partNumber: initialData.part_number || "",
        partName: initialData.part_name || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEditing, initialData, initialFormState]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "reelSize":
        if (value && (isNaN(value) || value < 1 || value > 100)) {
          newErrors[name] = "Reel size must be between 1 and 100";
        } else {
          delete newErrors[name];
        }
        break;
      case "gsm":
        if (value && (isNaN(value) || value < 1 || value > 1000)) {
          newErrors[name] = "GSM must be between 1 and 1000";
        } else {
          delete newErrors[name];
        }
        break;
      case "bf":
        if (value && (isNaN(value) || value < 1 || value > 1000)) {
          newErrors[name] = "BF must be between 1 and 1000";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "reelSize" || name === "gsm" || name === "bf") {
        if (newData.reelSize && newData.gsm && newData.bf) {
          newData.partName = `${newData.reelSize}/${newData.gsm}/${newData.bf}`;
        }
      }

      return newData;
    });
    validateField(name, value);
  };

  const handleSave = async () => {
    const isValid = ["reelSize", "gsm", "bf"].every((field) =>
      validateField(field, formData[field])
    );

    if (isValid) {
      try {
        if (isEditing) {
          const response = await axios.put(
            `${API_BASE_URL}/update.php`,
            formData
          );
          onUpdate(response.data);
        } else {
          const response = await axios.post(
            `${API_BASE_URL}/create.php`,
            formData
          );
          if (response.data.id) {
            onSave(response.data);
          } else {
            throw new Error(
              response.data.message || "Failed to create paper master"
            );
          }
        }
        showAlert(
          `Paper Master ${isEditing ? "updated" : "saved"} successfully!`,
          "success"
        );
        onCancel();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        showAlert(errorMessage, "error");
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setErrors({});
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto mt-16 paper-box shade-form-card">
      <h2 className="text-2xl font-bold mb-6 card-header-paper heading-paper-master">
        {isEditing ? "Update Paper Master" : "Add Paper Master"}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold input-fiel-name-paper1">
            Reel Size
          </label>
          <input
            type="number"
            name="reelSize"
            value={formData.reelSize}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-32 input-text-paper"
          />
          {errors.reelSize && (
            <span className="text-red-500 text-sm">{errors.reelSize}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold input-fiel-name-paper2">
            GSM
          </label>
          <input
            type="number"
            name="gsm"
            value={formData.gsm}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-32 input-text-paper"
          />
          {errors.gsm && (
            <span className="text-red-500 text-sm">{errors.gsm}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold input-fiel-name-paper3">
            BF
          </label>
          <input
            type="number"
            name="bf"
            value={formData.bf}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-32 input-text-paper"
          />
          {errors.bf && (
            <span className="text-red-500 text-sm">{errors.bf}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold input-fiel-name-paper4">
            Part No.
          </label>
          <input
            type="text"
            value={formData.partNumber}
            disabled
            className="border rounded px-3 py-2 w-32 bg-gray-100 input-text-paper"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="w-32 font-semibold input-fiel-name-paper5">
            Part Name
          </label>
          <input
            type="text"
            value={formData.partName}
            disabled
            className="border rounded px-3 py-2 w-full bg-gray-100 input-text-paper"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 button-cancel"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 button-save"
          >
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchAndFilters = ({ onSearch, onFilter }) => {
  const initialFilterState = {
    reelSize: "",
    gsm: "",
    bf: "",
  };

  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState(initialFilterState);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    onFilter(initialFilterState);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 filter-search-container">
      <div className="flex flex-col space-y-4">
        <div className="relative search-container">
          <input
            type="text"
            placeholder="Search by Paper Name..."
            className="w-full border rounded px-3 py-2 pl-8"
            onChange={(e) => onSearch(e.target.value)}
          />
          <span className="absolute left-2.5 top-2.5">🔍</span>
        </div>

        <div className="flex space-x-4 filter-container">
          <div className="flex items-center space-x-2 ">
            <label className="text-sm font-medium">Reel Size:</label>
            <input
              type="number"
              name="reelSize"
              className="border rounded px-3 py-2 w-24"
              value={filters.reelSize}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">GSM:</label>
            <input
              type="number"
              name="gsm"
              className="border rounded px-3 py-2 w-24"
              value={filters.gsm}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">BF:</label>
            <input
              type="number"
              name="bf"
              className="border rounded px-3 py-2 w-24"
              value={filters.bf}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 reset"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

const PaperMasterTable = ({ data, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 15;

  // Sorting and filtering function
  const processPapers = () => {
    let processedData = [...data];

    // Sort if a column is selected
    if (sortColumn) {
      processedData.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Handle string comparison for part_name
        if (sortColumn === 'part_name') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        // Handle numeric comparison for other columns
        if (typeof valueA === 'number' || !isNaN(Number(valueA))) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  };

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

  // Apply sorting and pagination
  const filteredPapers = processPapers();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPapers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden table-paper table-container-width">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('part_name')}
              >
                Paper Name
                <SortIcon column="part_name" />
              </th>

              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('reel_size')}
              >
                Reel Size
                <SortIcon column="reel_size" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('gsm')}
              >
                GSM
                <SortIcon column="gsm" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('bf')}
              >
                BF
                <SortIcon column="bf" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('part_number')}
              >
                Part Number
                <SortIcon column="part_number" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((paper) => (
              <tr key={paper.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {paper.part_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {paper.reel_size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{paper.gsm}</td>
                <td className="px-6 py-4 whitespace-nowrap">{paper.bf}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {paper.part_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2 actions">
                    <button
                      className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-50 btn-update"
                      onClick={() => onEdit(paper)}
                    >
                      Update
                    </button>
                    <button
                      className="px-3 py-1 border rounded text-red-600 hover:bg-red-50 btn-delete"
                      onClick={() => onDelete(paper.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
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
  );
};

const PaperMasterFind = () => {
  const [paperMasters, setPaperMasters] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    reelSize: "",
    gsm: "",
    bf: "",
  });
  const [editingPaper, setEditingPaper] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };

  // Fetch paper masters on component mount
  useEffect(() => {
    fetchPaperMasters();
  }, []);

  const fetchPaperMasters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/read.php`);
      setPaperMasters(response.data);
      setFilteredData(response.data);
    } catch (error) {
      showAlert(
        `Error fetching Paper Masters: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  };

  const filterData = useCallback(() => {
    let filtered = [...paperMasters];

    if (searchTerm) {
      filtered = filtered.filter((paper) =>
        paper.part_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.reelSize) {
      filtered = filtered.filter(
        (paper) =>
          paper.reel_size && paper.reel_size.toString() === filters.reelSize
      );
    }

    if (filters.gsm) {
      filtered = filtered.filter(
        (paper) => paper.gsm.toString() === filters.gsm
      );
    }
    if (filters.bf) {
      filtered = filtered.filter((paper) => paper.bf.toString() === filters.bf);
    }

    setFilteredData(filtered);
  }, [searchTerm, filters, paperMasters]);

  // useEffect(() => {
  //   filterData();
  // }, [filterData]);

  const handleSave = (formData) => {
    setPaperMasters((prev) => [...prev, formData]);
    setFilteredData((prev) => [...prev, formData]);
    showAlert("Paper Master added successfully!", "success");
  };
  const handleUpdate = (updatedPaper) => {
    setPaperMasters((prev) =>
      prev.map((paper) => (paper.id === updatedPaper.id ? updatedPaper : paper))
    );
    setFilteredData((prev) =>
      prev.map((paper) => (paper.id === updatedPaper.id ? updatedPaper : paper))
    );
    setEditingPaper(null);
    showAlert("Paper Master updated successfully!", "success");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this paper master?")) {
      try {
        // await axios.delete(`${API_BASE_URL}/${id}`);
        await axios.delete(`${API_BASE_URL}/delete.php?id=${id}`);
        setPaperMasters((prev) => prev.filter((paper) => paper.id !== id));
        setFilteredData((prev) => prev.filter((paper) => paper.id !== id));
        showAlert("Paper Master deleted successfully!", "success");
      } catch (error) {
        showAlert(
          `Error deleting Paper Master: ${
            error.response?.data?.message || error.message
          }`,
          "error"
        );
      }
    }
  };

  const handleSearch = async (term) => {
    try {
      // Filter locally for partial matches
      let filtered = paperMasters;
      
      if (term) {
        filtered = filtered.filter(paper => 
          paper.part_name?.toLowerCase().includes(term.toLowerCase())
        );
      }
      
      // Apply numeric filters with partial matching
      if (filters.reelSize) {
        filtered = filtered.filter(paper => 
          paper.reel_size?.toString().includes(filters.reelSize)
        );
      }
      
      if (filters.gsm) {
        filtered = filtered.filter(paper => 
          paper.gsm?.toString().includes(filters.gsm)
        );
      }
      
      if (filters.bf) {
        filtered = filtered.filter(paper => 
          paper.bf?.toString().includes(filters.bf)
        );
      }

      setSearchTerm(term);
      setFilteredData(filtered);
    } catch (error) {
      showAlert(`Error searching Paper Masters: ${error.message}`, "error");
    }
  };

  const handleFilter = async (newFilters) => {
    setFilters(newFilters);
    try {
      // Filter locally for partial matches
      let filtered = paperMasters;
      
      if (searchTerm) {
        filtered = filtered.filter(paper =>
          paper.part_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (newFilters.reelSize) {
        filtered = filtered.filter(paper =>
          paper.reel_size?.toString().includes(newFilters.reelSize)
        );
      }

      if (newFilters.gsm) {
        filtered = filtered.filter(paper =>
          paper.gsm?.toString().includes(newFilters.gsm)
        );
      }

      if (newFilters.bf) {
        filtered = filtered.filter(paper =>
          paper.bf?.toString().includes(newFilters.bf)
        );
      }

      setFilteredData(filtered);
    } catch (error) {
      showAlert(`Error filtering Paper Masters: ${error.message}`, "error");
    }
  };


  const handleEdit = (paper) => {
    setEditingPaper(paper);
    // setShowForm(true);
  };

  const handleCancel = () => {
    setEditingPaper(null);
    // setShowForm(false);
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <NavigationPaperDashboard />
      <div className="paper-master-container">
        <div className="paper-master-layout">
          <div className="form-section">
            <PaperMasterForm
              onSave={handleSave}
              lastPartNumber={paperMasters.length}
              initialData={editingPaper}
              isEditing={!!editingPaper}
              onUpdate={handleUpdate}
              onCancel={handleCancel}
              showAlert={showAlert}
            />
          </div>

          <div className="table-section">
            <SearchAndFilters onSearch={handleSearch} onFilter={handleFilter} />
            <div className="table-container">
              <PaperMasterTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaperMasterFind;
