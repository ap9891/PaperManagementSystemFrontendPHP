import React, { useState, useEffect } from "react";
import axios from "axios";
import "./inventory.css";
import API_ENDPOINTS from "../../config/config";

const InventoryModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [stockOutHistory, setStockOutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      fetchStockOutHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchStockOutHistory = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.REELS.HISTORY);
      setStockOutHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching stock out history:", err);
      setStockOutHistory([]);
    }
  };

  const calculateQuantityUsed = (reelNumber) => {
    return stockOutHistory
      .filter((history) => history.reel_number === reelNumber)
      .reduce(
        (total, history) => total + (Number(history.quantity_used) || 0),
        0
      );
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
        params: { searchTerm: "" },
      });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Calculate quantities and prices for each inventory item
      const processedData = data.map((item) => {
        const quantityUsed = calculateQuantityUsed(item.reelNumber);
        const quantityLeft = item.quantity - quantityUsed;
        return {
          ...item,
          quantityUsed,
          quantityLeft,
          totalPrice: quantityLeft * item.ratePerKg,
        };
      });

      setInventoryData(processedData);
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
      const response = await axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
        params: { searchTerm: query },
      });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Process search results with quantity calculations
      const processedData = data.map((item) => {
        const quantityUsed = calculateQuantityUsed(item.reelNumber);
        const quantityLeft = item.quantity - quantityUsed;
        return {
          ...item,
          quantityUsed,
          quantityLeft,
          totalPrice: quantityLeft * item.ratePerKg,
        };
      });

      setInventoryData(processedData);
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

  // Calculate totals for the summary
  const calculateTotals = () => {
    return inventoryData.reduce(
      (acc, item) => ({
        totalQuantity: acc.totalQuantity + (item.quantityLeft || 0),
        totalValue: acc.totalValue + (item.totalPrice || 0),
      }),
      { totalQuantity: 0, totalValue: 0 }
    );
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventoryData.slice(indexOfFirstItem, indexOfLastItem);
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

  const { totalQuantity, totalValue } = calculateTotals();

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
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              const timeoutId = setTimeout(() => handleSearch(query), 300);
              return () => clearTimeout(timeoutId);
            }}
            className="search-input w-full"
          />
        </div>

        {/* Summary Section */}
        {/* <div className="bg-gray-50 p-4 mb-4 rounded-lg">
          <div className="flex justify-between">
            <div className="text-gray-700">
              <span className="font-semibold">Total Quantity Left:</span>{' '}
              <span className="text-blue-600">{totalQuantity.toFixed(2)} kg</span>
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Total Inventory Value:</span>{' '}
              <span className="text-blue-600">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div> */}

        <div
          className="summary-box"
          style={{
            background: "#f8f9fa",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "40px",
            }}
          >
            <div>
              <strong>Total Quantity:</strong>{" "}
              <span style={{ color: "#2c5282" }}>
                {totalQuantity.toFixed(2)} kg
              </span>
            </div>
            <div>
              <strong>Total Price:</strong>{" "}
              <span style={{ color: "#2c5282" }}>₹{totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {loading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reel Number</th>
                <th>Paper Name</th>
                {/* <th>Initial Qty</th>
                <th>Qty Used</th> */}
                <th>Qty Left</th>
                <th>Mill Name</th>
                <th>Shade</th>
                <th>Days</th>
                <th>Rate/kg (₹)</th>
                <th>Value</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 &&
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className={item.quantityLeft === 0 ? "bg-red-50" : ""}
                  >
                    <td>{item.reelNumber}</td>
                    <td>{item.paperName}</td>
                    {/* <td>{item.quantity}</td>
                    <td className="text-red-600">{item.quantityUsed}</td> */}
                    <td className="font-medium text-blue-600">
                      {item.quantityLeft}
                    </td>
                    <td>{item.millName}</td>
                    <td>{item.shade}</td>
                    <td>{item.days}</td>
                    <td>₹{item.ratePerKg.toFixed(2)}</td>
                    <td className="font-medium text-green-600">
                      ₹{item.totalPrice.toFixed(2)}
                    </td>
                    <td>{item.remark || "-"}</td>
                  </tr>
                ))}
              {(!Array.isArray(inventoryData) || inventoryData.length === 0) &&
                !loading && (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No inventory data found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {inventoryData.length > 0 && (
            <div className="flex justify-center items-center gap-2 py-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <span className="material-icons">chevron_left</span>
              </button>

              <div className="text-sm text-gray-700 w-44 text-center">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
