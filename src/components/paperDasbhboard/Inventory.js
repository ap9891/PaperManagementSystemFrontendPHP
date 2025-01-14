import React, { useState, useEffect } from "react";
import axios from "axios";
import "./inventory.css";
import API_ENDPOINTS from "../../config/config";

const InventoryModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
        params: { searchTerm: "" },
      });
      setInventoryData(
        Array.isArray(response.data) ? response.data : response.data.data || []
      );
    } catch (err) {
      setError("Failed to fetch inventory data");
      console.error("Error fetching inventory:", err);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      fetchInitialData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // const response = await axios.get("/api/inventory/search", {
      //   params: { searchTerm: query },
      // });
      const response = await axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
        params: { searchTerm: query },
      });
      setInventoryData(
        Array.isArray(response.data) ? response.data : response.data.data || []
      );
    } catch (err) {
      setError("Failed to perform search");
      console.error("Search error:", err);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const resetSearch = () => {
    setSearchQuery("");
    fetchInitialData();
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(inventoryData)
    ? inventoryData.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(inventoryData.length / itemsPerPage);

  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div>
          <button
            className="close-button"
            aria-label="Close modal"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="modal-header">
          <h2>Inventory Management</h2>
        </div>

        <div className="search-container mb-4">
          <input
            type="text"
            placeholder="Search by paper name, reel number, mill name, or shade..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input w-full"
          />
        </div>

        {loading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reel Number</th>
                <th>Paper Name</th>
                <th>Quantity (Tons)</th>
                <th>Mill Name</th>
                <th>Shade</th>
                <th>Days</th>
                <th>Rate/kg</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 &&
                currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.reelNumber}</td>
                    <td>{item.paperName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.millName}</td>
                    <td>{item.shade}</td>
                    <td>{item.days}</td>
                    <td>{item.ratePerKg.toFixed(2)}</td>
                    <td>{item.remark || "-"}</td>
                  </tr>
                ))}
              {(!Array.isArray(inventoryData) || inventoryData.length === 0) &&
                !loading && (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No inventory data found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {inventoryData.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                padding: "20px 0",
              }}
            >
              <button
                style={{ width: "50px" }}
                onClick={goToPreviousPage}
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
                style={{ width: "50px" }}
                className="button secondary"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* <div className="button-group">
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default InventoryModal;
