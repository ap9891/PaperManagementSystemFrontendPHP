import React, { useState, useEffect } from "react";
import axios from "axios";
import "./paperOut.css";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";

const PaperOutModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("reel-out");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReel, setSelectedReel] = useState(null);
  const [outQuantity, setOutQuantity] = useState("");
  const [reels, setReels] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Calculate current items and total pages
  const getPaginatedData = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    return { currentItems, totalPages };
  };

  const { currentItems: paginatedReels, totalPages: reelTotalPages } =
    getPaginatedData(reels);
  const { currentItems: paginatedHistory, totalPages: historyTotalPages } =
    getPaginatedData(history);

  // Calculate history totals
  const calculateHistoryTotals = () => {
    const totalQuantity = history.reduce(
      (sum, entry) => sum + Number(entry.quantity_used),
      0
    );
    const totalPrice = history.reduce(
      (sum, entry) =>
        sum + Number(entry.quantity_used) * Number(entry.rate_per_kg),
      0
    );
    return { totalQuantity, totalPrice };
  };

  // Pagination handlers
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (
      currentPage <
      (activeTab === "reel-out" ? reelTotalPages : historyTotalPages)
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchReels();
      fetchHistory();
    }
  }, [isOpen]);

  const fetchReels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reelsResponse = await axios.get(API_ENDPOINTS.REELS.READ);
      setReels(Array.isArray(reelsResponse.data) ? reelsResponse.data : []);
    } catch (err) {
      setError("Failed to fetch reels. Please try again.");
      console.error("Reels fetch error:", err);
      setReels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const historyResponse = await axios.get(API_ENDPOINTS.REELS.HISTORY);
      setHistory(
        Array.isArray(historyResponse.data) ? historyResponse.data : []
      );
    } catch (err) {
      setError("Failed to fetch history. Please try again.");
      console.error("History fetch error:", err);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchReels = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchResponse = await axios.get(
        `${API_ENDPOINTS.REELS.SEARCH}?searchTerm=${encodeURIComponent(query)}`
      );
      setReels(Array.isArray(searchResponse.data) ? searchResponse.data : []);
    } catch (err) {
      setError("Failed to search reels. Please try again.");
      console.error("Reels search error:", err);
      setReels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      if (query) {
        searchReels(query);
      } else {
        fetchReels();
      }
    }, 300);
  };

  const handleOutQuantitySubmit = async () => {
    if (!selectedReel || !outQuantity || isNaN(outQuantity)) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_ENDPOINTS.REELS.STOCK_OUT, {
        reelNumber: selectedReel.reel_number,
        outQuantity: Number(outQuantity),
      });

      if (response.data.success) {
        fetchReels();
        fetchHistory();
        setSuccessMessage(
          `Successfully stocked out ${outQuantity} from reel ${selectedReel.reel_number}`
        );
        setSelectedReel(null);
        setOutQuantity("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to stock out reel. Please try again."
      );
      console.error("Reel out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReelDoubleClick = (reel) => {
    setSelectedReel(reel);
  };

  if (!isOpen) return null;

  const renderPagination = (totalPages) => (
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
        <strong>{totalPages || 1}</strong>
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
  );

  // Calculate totals for the history tab
  const { totalQuantity, totalPrice } = calculateHistoryTotals();

  return (
    <div className="modal-overlay">
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="modal-content">
        <div>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-header">
          <h2>Paper Out Management</h2>
        </div>

        {isLoading && <div className="loading-spinner">Loading...</div>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "reel-out" ? "active" : ""}`}
            onClick={() => setActiveTab("reel-out")}
          >
            Reel Out
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {activeTab === "reel-out" ? (
          <div className="form-content">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by paper name, shade, reel number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Paper Name</th>
                    <th>Quantity</th>
                    <th>Mill Name</th>
                    <th>Shade</th>
                    <th>Rate</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReels.map((reel) => (
                    <tr
                      key={reel.id}
                      onDoubleClick={() => handleReelDoubleClick(reel)}
                      className="table-row-hover"
                    >
                      <td>
                        {reel.is_partially_used ? (
                          <span className="star">★</span>
                        ) : null}
                      </td>
                      <td>{reel.paper_name}</td>
                      <td>{reel.quantity}</td>
                      <td>{reel.mill_name}</td>
                      <td>{reel.shade}</td>
                      <td>{reel.rate}</td>
                      <td>{reel.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(reelTotalPages)}
            </div>
          </div>
        ) : (
          <div className="table-container">
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
                  <span style={{ color: "#2c5282" }}>
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Reel Number</th>
                  <th>Paper Name</th>
                  <th>Quantity Used</th>
                  <th>Quantity Left</th>
                  <th>Mill Name</th>
                  <th>Shade</th>
                  <th>Rate/kg</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.reel_number}</td>
                    <td>{entry.paper_name}</td>
                    <td>{entry.quantity_used}</td>
                    <td>{entry.quantity_left}</td>
                    <td>{entry.mill_name}</td>
                    <td>{entry.shade}</td>
                    <td>{entry.rate_per_kg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination(historyTotalPages)}
          </div>
        )}

        {selectedReel && (
          <div className="modal-overlay">
            <div className="modal-content sub-modal">
              <div className="modal-header">
                <h2>Reel Out - {selectedReel.reel_number}</h2>
              </div>
              <div className="form-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="outQuantity">Out Quantity</label>
                    <input
                      type="number"
                      id="outQuantity"
                      value={outQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0) {
                          setOutQuantity(value);
                        } else {
                          setError("Quantity must be a positive value.");
                        }
                      }}
                      max={selectedReel.quantity}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="balance">Balance</label>
                    <input
                      type="number"
                      id="balance"
                      value={
                        outQuantity
                          ? selectedReel.quantity - Number(outQuantity)
                          : selectedReel.quantity
                      }
                      disabled
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button
                    className="button secondary"
                    onClick={() => setSelectedReel(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    onClick={handleOutQuantitySubmit}
                    disabled={
                      !outQuantity ||
                      Number(outQuantity) > selectedReel.quantity ||
                      isLoading
                    }
                  >
                    {isLoading ? "Processing..." : "Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperOutModal;
