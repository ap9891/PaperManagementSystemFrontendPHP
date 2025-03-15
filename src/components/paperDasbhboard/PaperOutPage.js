import React, { useState, useEffect } from "react";
import axios from "axios";
// import NavigationPaperDashboard from "../navbar/Navbar";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";
import "./paperOut.css";

const PaperOutPage = () => {
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
  const [itemsPerPage] = useState(15);

  const [showReelDetails, setShowReelDetails] = useState(false);
  const [filters, setFilters] = useState({
    paperName: "",
    millName: "",
    shadeName: "",
    reelNumber: "",
    startDate: "",
    endDate: "",
  });

  // Calculate current items and total pages
  const getPaginatedData = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    return { currentItems, totalPages };
  };

  // const { currentItems: paginatedReels, totalPages: reelTotalPages } =
  //   getPaginatedData(reels);
  // const { currentItems: paginatedHistory, totalPages: historyTotalPages } =
  //   getPaginatedData(history);

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

  // Add this to your useEffect to handle filter changes
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (Object.values(filters).some((value) => value)) {
        searchReels(filters);
      } else {
        fetchReels(); // Fetch all reels if no filters are active
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [filters]);
  // useEffect(() => {
  //   if (isOpen) {
  //     fetchReels();
  //     fetchHistory();
  //   }
  // }, [isOpen]);

  useEffect(() => {
    // Only search if both dates are set
    if (filters.startDate && filters.endDate) {
      searchReels(filters);
    }
  }, [filters.startDate, filters.endDate]);

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

  const searchReels = async (filters) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a new URLSearchParams object
      const queryParams = new URLSearchParams();

      // Process each filter value
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // For millName, shadeName, and reelNumber, send the partial value directly
          if (["millName", "shadeName", "reelNumber"].includes(key)) {
            queryParams.append(key, value);
          } else {
            // For other fields, keep the existing behavior
            queryParams.append(key, value);
          }
        }
      });

      const searchResponse = await axios.get(
        `${API_ENDPOINTS.REELS.SEARCH}?${queryParams.toString()}`
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [field]: value,
      };

      // If setting end date, ensure it's not before start date
      if (
        field === "endDate" &&
        newFilters.startDate &&
        value < newFilters.startDate
      ) {
        return prev; // Don't update if invalid
      }

      // If setting start date, clear end date if it becomes invalid
      if (
        field === "startDate" &&
        newFilters.endDate &&
        value > newFilters.endDate
      ) {
        newFilters.endDate = "";
      }

      return newFilters;
    });
  };
  const handleReset = () => {
    setFilters({
      paperName: "",
      millName: "",
      shadeName: "",
      reelNumber: "",
      startDate: "",
      endDate: "",
    });
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

  const handleReelClick = (reel) => {
    setSelectedReel(reel);
    setShowReelDetails(true);
  };

  const handleCloseReelDetails = () => {
    setShowReelDetails(false);
    setSelectedReel(null);
    setOutQuantity("");
  };

  // if (!isOpen) return null;

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

  // Calculate totals for the reel out
  const calculateReelTotals = () => {
    const totalQuantity = reels.reduce(
      (sum, reel) => sum + Number(reel.quantity),
      0
    );
    const totalPrice = reels.reduce(
      (sum, reel) => sum + Number(reel.quantity) * Number(reel.rate),
      0
    );
    return { totalQuantity, totalPrice };
  };

  useEffect(() => {
    fetchReels();
    fetchHistory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);
  // Sorting states
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const naturalSortReel = (a, b) => {
    const extractParts = (reel) => {
      const match = reel.match(/([a-zA-Z-]+)(\d+)/);
      return match
        ? { prefix: match[1], number: parseInt(match[2], 10) }
        : { prefix: reel, number: 0 };
    };

    const aParts = extractParts(a);
    const bParts = extractParts(b);

    // First compare prefixes
    if (aParts.prefix !== bParts.prefix) {
      return aParts.prefix.localeCompare(bParts.prefix);
    }

    // Then compare numbers
    return aParts.number - bParts.number;
  };

  // Sorting function
  const processSortedData = (items) => {
    if (!sortColumn) return items;

    return [...items].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      // Handle numeric sorting
      if (["quantity", "rate", "days"].includes(sortColumn)) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else if (sortColumn === "reel_number") {
        const sortMultiplier = sortDirection === "asc" ? 1 : -1;
        return sortMultiplier * naturalSortReel(a[sortColumn], b[sortColumn]);
      }
      // Handle string sorting
      else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Handling sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      // If already sorting this column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If new column, start with ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sorting icon component
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="ml-2 text-gray-300">↕️</span>;
    }
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  // Pagination and data processing
  const processData = (items) => {
    // First sort
    const sortedItems = processSortedData(items);

    // Then paginate
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

    return { currentItems, totalPages };
  };

  // Process reels and history
  const { currentItems: paginatedReels, totalPages: reelTotalPages } =
    processData(reels);
  const { currentItems: paginatedHistory, totalPages: historyTotalPages } =
    processData(history);
  const containerStyle = {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  };

  const searchGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    alignItems: "center",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  };

  const dateContainerStyle = {
    display: "flex",
    gap: "10px",
  };

  const resetButtonStyle = {
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontSize: "14px",
    marginLeft: "5em",
    width: "67%",
  };
  // Render method (similar to modal, but with full page layout)
  return (
    <div className="paper-out-page">
      <NavigationPaperDashboard />

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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl text-2xl-inventoryOut font-bold mb-6">
          Paper Out Management
        </h1>

        {isLoading && <div className="loading-spinner">Loading...</div>}

        <div className="tabs mb-4">
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

        {/* Rest of the content from PaperOutModal, adapted for full page */}
        {activeTab === "reel-out" ? (
          <div className="form-content form-content-paperOut">
            {/* <div className="search-container"> */}
            {/* <div class="search-container">
              <input
                type="text"
                placeholder="Search by paper name, shade, reel number..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
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
                    {calculateReelTotals().totalQuantity.toFixed(2)} kg
                  </span>
                </div>
                <div>
                  <strong>Total Price:</strong>{" "}
                  <span style={{ color: "#2c5282" }}>
                    ₹{calculateReelTotals().totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={containerStyle}>
              <div style={searchGridStyle}>
                {/* Paper Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Paper Name"
                    style={inputStyle}
                    value={filters.paperName}
                    onChange={(e) =>
                      handleFilterChange("paperName", e.target.value)
                    }
                  />
                </div>

                {/* Mill Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Mill Name"
                    style={inputStyle}
                    value={filters.millName}
                    onChange={(e) =>
                      handleFilterChange("millName", e.target.value)
                    }
                  />
                </div>

                {/* Shade Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Shade Name"
                    style={inputStyle}
                    value={filters.shadeName}
                    onChange={(e) =>
                      handleFilterChange("shadeName", e.target.value)
                    }
                  />
                </div>

                {/* Reel Number */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Reel Number"
                    style={inputStyle}
                    value={filters.reelNumber}
                    onChange={(e) =>
                      handleFilterChange("reelNumber", e.target.value)
                    }
                  />
                </div>

                {/* Date Range */}
                <div style={dateContainerStyle}>
                  <input
                    type="date"
                    style={inputStyle}
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    style={inputStyle}
                    value={filters.endDate}
                    min={filters.startDate} // This ensures end date can't be before start date
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    disabled={!filters.startDate} // Disable end date until start date is selected
                  />
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    onClick={handleReset}
                    style={resetButtonStyle}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#e0e0e0")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#f0f0f0")
                    }
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            {/* Table and pagination similar to modal version */}
            {/* <div className="table-container"> */}
            {/* <table> */}
            <div class="table-container table-container-paperOut">
              <table class="table">
                {/* Table headers and rows similar to modal version */}
                <thead>
                  <tr>
                    <th>Status</th>
                    <th
                      onClick={() => handleSort("paper_name")}
                      className="cursor-pointer"
                    >
                      Paper Name <SortIcon column="paper_name" />
                    </th>
                    <th
                      onClick={() => handleSort("reel_number")}
                      className="cursor-pointer"
                    >
                      Reel Number <SortIcon column="reel_number" />
                    </th>
                    <th
                      onClick={() => handleSort("quantity")}
                      className="cursor-pointer"
                    >
                      Quantity(kg) <SortIcon column="quantity" />
                    </th>
                    <th
                      onClick={() => handleSort("mill_name")}
                      className="cursor-pointer"
                    >
                      Mill Name <SortIcon column="mill_name" />
                    </th>
                    <th
                      onClick={() => handleSort("shade")}
                      className="cursor-pointer"
                    >
                      Shade <SortIcon column="shade" />
                    </th>
                    <th
                      onClick={() => handleSort("rate")}
                      className="cursor-pointer"
                    >
                      Rate(₹) <SortIcon column="rate" />
                    </th>
                    <th
                      onClick={() => handleSort("days")}
                      className="cursor-pointer"
                    >
                      Days <SortIcon column="days" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReels.map((reel) => (
                    <tr
                      key={reel.id}
                      onClick={() => handleReelClick(reel)}
                      className="table-row-hover"
                    >
                      {/* Table row content */}
                      <td>
                        {reel.is_partially_used ? (
                          <span className="status used">Used</span>
                        ) : (
                          <span className="status fresh">Fresh</span>
                        )}
                      </td>
                      <td>{reel.paper_name}</td>
                      <td>{reel.reel_number}</td>
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
          <div className="table-container table-container-paperOut">
            {/* History tab content similar to modal version */}
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
                  <th
                    onClick={() => handleSort("reel_number")}
                    className="cursor-pointer"
                  >
                    Reel Number <SortIcon column="reel_number" />
                  </th>
                  <th
                    onClick={() => handleSort("paper_name")}
                    className="cursor-pointer"
                  >
                    Paper Name <SortIcon column="paper_name" />
                  </th>
                  <th
                    onClick={() => handleSort("quantity_used")}
                    className="cursor-pointer"
                  >
                    Quantity Used(kg) <SortIcon column="quantity_used" />
                  </th>
                  <th
                    onClick={() => handleSort("quantity_left")}
                    className="cursor-pointer"
                  >
                    Quantity Left(kg)<SortIcon column="quantity_left" />
                  </th>
                  <th
                    onClick={() => handleSort("mill_name")}
                    className="cursor-pointer"
                  >
                    Mill Name <SortIcon column="mill_name" />
                  </th>
                  <th
                    onClick={() => handleSort("shade")}
                    className="cursor-pointer"
                  >
                    Shade <SortIcon column="shade" />
                  </th>
                  <th
                    onClick={() => handleSort("rate_per_kg")}
                    className="cursor-pointer"
                  >
                   Rate/kg(₹) <SortIcon column="rate_per_kg" />
                  </th>
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

        {/* Reel Out Sub-Modal (now a modal within the page) */}
        {showReelDetails && selectedReel && (
          <div className="reel-details-overlay">
            <div className="reel-details-modal">
              <div className="reel-details-header">
                <h3>Reel Details</h3>
                <button
                  className="close-button-paperOut"
                  onClick={handleCloseReelDetails}
                >
                  &times;
                </button>
              </div>

              <div className="reel-details-content">
                <div className="reel-info-grid">
                  <div className="reel-info-item">
                    <label>Paper Name</label>
                    <span>{selectedReel.paper_name}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Reel Number</label>
                    <span>{selectedReel.reel_number}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Mill Name</label>
                    <span>{selectedReel.mill_name}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Shade</label>
                    <span>{selectedReel.shade}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Current Quantity</label>
                    <span>{selectedReel.quantity} kg</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Rate</label>
                    <span>₹{selectedReel.rate}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Days in Stock</label>
                    <span>{selectedReel.days}</span>
                  </div>
                  <div className="reel-info-item">
                    <label>Status</label>
                    <span
                      className={`status ${
                        selectedReel.is_partially_used ? "used" : "fresh"
                      }`}
                    >
                      {selectedReel.is_partially_used ? "Used" : "Fresh"}
                    </span>
                  </div>
                </div>

                <div className="reel-out-form">
                  <h4>Stock Out</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="outQuantity">Out Quantity (kg)</label>
                      <input
                        type="number"
                        id="outQuantity"
                        value={outQuantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value >= 0) {
                            setOutQuantity(value);
                          }
                        }}
                        max={selectedReel.quantity}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="balance">Balance (kg)</label>
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
                      className="cancel-button"
                      onClick={handleCloseReelDetails}
                    >
                      Cancel
                    </button>
                    <button
                      className="submit-button"
                      onClick={handleOutQuantitySubmit}
                      disabled={
                        !outQuantity ||
                        Number(outQuantity) > selectedReel.quantity ||
                        isLoading
                      }
                    >
                      {isLoading ? "Processing..." : "Stock Out"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperOutPage;
