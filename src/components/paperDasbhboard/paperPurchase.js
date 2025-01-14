import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./PaperPurchase.css";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";

const API_BASE_URL = API_ENDPOINTS.BASE;

const PaperPurchaseModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("new");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    reelNumber: "",
    paperName: "",
    quantity: "",
    millName: "",
    shade: "",
    ratePerKg: "",
    price: "",
    remark: "",
  });
  // State for master data and history
  const [paperMasterData, setPaperMasterData] = useState([]);
  const [millMasterData, setMillMasterData] = useState([]);
  const [shadeMasterData, setShadeMasterData] = useState([]);
  const [history, setHistory] = useState([]);
  const [alert, setAlert] = useState(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [totals, setTotals] = useState({
    totalQuantity: 0,
    totalPrice: 0,
  });

  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [paperResponse, millResponse, shadeResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.PAPER}/read.php`),
          axios.get(API_ENDPOINTS.MILL),
          axios.get(API_ENDPOINTS.SHADE),
        ]);
        // Transform paper names data to handle object structure
        const paperNames = paperResponse.data.map((paper) => ({
          value: paper.part_name,
          label: `${paper.part_name} (${paper.gsm} GSM, ${paper.type})`,
          ...paper,
        }));

        // Transform mill names data
        const millNames = millResponse.data.map((mill) => ({
          value: mill.mill_name,
          label: mill.mill_name,
          id: mill.mill_id,
        }));

        // Transform shade data
        const shades = shadeResponse.data.map((shade) => ({
          value: shade.shadeName,
          label: shade.shadeName,
          id: shade.shadeId,
        }));

        setPaperMasterData(paperNames);
        setMillMasterData(millNames);
        setShadeMasterData(shades);
      } catch (error) {
        console.error("Error fetching master data:", error);
        setAlert({
          type: "error",
          message: "Failed to load master data",
        });
      }
    };

    const fetchPurchaseHistory = async () => {
      try {
        // const response = await axios.get("/api/paper-purchases/read.php");
        const response = await axios.get(API_ENDPOINTS.PAPER_PURCHASES.READ);
        // const response = await axiosInstance.get(`${API_ENDPOINTS.PAPER}/paper-purchases/read.php`)
        // Calculate totals from all records
        const calculatedTotals = response.data.reduce(
          (acc, curr) => {
            return {
              totalQuantity: acc.totalQuantity + parseFloat(curr.quantity || 0),
              totalPrice: acc.totalPrice + parseFloat(curr.price || 0),
            };
          },
          { totalQuantity: 0, totalPrice: 0 }
        );
        setTotals(calculatedTotals);
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching purchase history:", error);
        setAlert({
          type: "error",
          message: "Failed to load purchase history",
        });
      }
    };

    if (isOpen) {
      fetchMasterData();
      fetchPurchaseHistory();
    }
  }, [isOpen]);

  // Generate Reel Number
  const generateReelNumber = useCallback(async () => {
    try {
      // const response = await axios.get(
      //   "/api/paper-purchases/generate-reel-number.php"
      // );
      const response = await axios.get(
        API_ENDPOINTS.PAPER_PURCHASES.GENERATE_REEL
      );
      // const response = await axiosInstance.get(`${API_ENDPOINTS.PAPER}/paper-purchases/generate-reel-number.php`);
      return response.data;
    } catch (error) {
      console.error("Error generating reel number:", error);
      setAlert({
        type: "error",
        message: "Failed to generate reel number",
      });
      return "";
    }
  }, []);

  // Update useEffect for reel number generation
  useEffect(() => {
    const fetchReelNumber = async () => {
      if (isOpen) {
        const reelNumber = await generateReelNumber();
        setFormData((prev) => ({
          ...prev,
          date: new Date().toISOString().split("T")[0],
          reelNumber: reelNumber,
        }));
      }
    };

    fetchReelNumber();
  }, [isOpen, generateReelNumber]);

  const calculatePrice = (quantity, rate) => {
    return quantity && rate
      ? (parseFloat(quantity) * parseFloat(rate)).toFixed(2)
      : "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "quantity" || field === "ratePerKg") {
        newData.price = calculatePrice(
          field === "quantity" ? value : prev.quantity,
          field === "ratePerKg" ? value : prev.ratePerKg
        );
      }

      return newData;
    });
  };

  const validateForm = () => {
    if (
      !formData.paperName ||
      !formData.quantity ||
      !formData.millName ||
      !formData.shade ||
      !formData.ratePerKg
    ) {
      setAlert({
        type: "warning",
        message: "Please fill all required fields",
      });
      return false;
    }

    if (parseInt(formData.quantity) < 1 || parseInt(formData.quantity) > 2000) {
      setAlert({
        type: "warning",
        message: "Quantity must be between 1 and 2000",
      });
      return false;
    }
    if (parseInt(formData.ratePerKg) < 1) {
      setAlert({
        type: "warning",
        message: "RatePerKg must be at least 1",
      });
      return false;
    }

    return true;
  };

  const handleSave = async (saveAndNext = false) => {
    if (!validateForm()) return;

    try {
      // const response = await axios.post(
      //   "/api/paper-purchases/create.php",
      //   formData
      // );
      // const response = await axios.post(`${API_ENDPOINTS.PAPER}/paper-purchases/create.php`);
      const response = await axios.post(
        API_ENDPOINTS.PAPER_PURCHASES.CREATE,
        formData
      );
      const savedPurchase = response.data;

      setHistory((prev) => [savedPurchase, ...prev]);

      setAlert({
        type: "success",
        message: "Paper purchase record saved successfully",
      });

      if (saveAndNext) {
        const newReelNumber = await generateReelNumber();
        setFormData((prev) => ({
          ...prev,
          reelNumber: newReelNumber,
          quantity: "",
          price: "",
          remark: "",
        }));
      } else {
        const newReelNumber = await generateReelNumber();
        setFormData({
          date: new Date().toISOString().split("T")[0],
          reelNumber: newReelNumber,
          paperName: "",
          quantity: "",
          millName: "",
          shade: "",
          ratePerKg: "",
          price: "",
          remark: "",
        });
      }
    } catch (error) {
      console.error("Error saving paper purchase:", error);
      setAlert({
        type: "error",
        message: "Failed to save paper purchase",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
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
          <h2>Paper Purchase</h2>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            New
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {activeTab === "new" ? (
          <div className="form-content">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date">
                  Date<span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reelNumber">Reel Number</label>
                <input
                  type="text"
                  id="reelNumber"
                  value={formData.reelNumber}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="paperName">
                  Paper Name<span className="required">*</span>
                </label>
                <select
                  id="paperName"
                  value={formData.paperName}
                  onChange={(e) =>
                    handleInputChange("paperName", e.target.value)
                  }
                >
                  <option value="">Select paper</option>
                  {paperMasterData.map((paper) => (
                    <option key={paper.id} value={paper.value}>
                      {paper.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity (kg)<span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="2000"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="millName">
                  Mill Name<span className="required">*</span>
                </label>
                <select
                  id="millName"
                  value={formData.millName}
                  onChange={(e) =>
                    handleInputChange("millName", e.target.value)
                  }
                >
                  <option value="">Select mill</option>
                  {millMasterData.map((mill) => (
                    <option key={mill.id} value={mill.value}>
                      {mill.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shade Field */}
              <div className="form-group">
                <label htmlFor="shade">
                  Shade<span className="required">*</span>
                </label>
                <select
                  id="shade"
                  value={formData.shade}
                  onChange={(e) => handleInputChange("shade", e.target.value)}
                >
                  <option value="">Select shade</option>
                  {shadeMasterData.map((shade) => (
                    <option key={shade.id} value={shade.value}>
                      {shade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ratePerKg">
                  Rate/kg (₹)<span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="ratePerKg"
                  step="0.01"
                  value={formData.ratePerKg}
                  onChange={(e) =>
                    handleInputChange("ratePerKg", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input type="text" id="price" value={formData.price} disabled />
              </div>

              <div className="form-group full-width">
                <label htmlFor="remark">Remark</label>
                <input
                  type="text"
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => handleInputChange("remark", e.target.value)}
                />
              </div>
            </div>

            <div className="button-group">
              <button className="button secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="button secondary"
                onClick={() => handleSave(false)}
              >
                Save
              </button>
              <button
                className="button primary"
                onClick={() => handleSave(true)}
              >
                Save & Next
              </button>
            </div>
          </div>
        ) : (
          <div>
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
                      {totals.totalQuantity.toFixed(2)} kg
                    </span>
                  </div>
                  <div>
                    <strong>Total Price:</strong>{" "}
                    <span style={{ color: "#2c5282" }}>
                      ₹{totals.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reel Number</th>
                    <th>Paper Name</th>
                    <th>Quantity (kg)</th>
                    <th>Mill Name</th>
                    <th>Shade</th>
                    <th>Rate/kg (₹)</th>
                    <th>Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.reel_number}</td>
                      <td>{entry.paper_name}</td>
                      <td>{entry.quantity}</td>
                      <td>{entry.mill_name}</td>
                      <td>{entry.shade}</td>
                      <td>{entry.ratePerKg}</td>
                      <td>{entry.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                padding: "20px 0",
              }}
            >
              {/* <button
                className="button secondary"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button> */}
              <button
                style={{ width: "50px" }}
                onClick={() => goToPreviousPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
              >
                <span className="material-icons">chevron_left</span>
              </button>

              {/* {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`button ${currentPage === index + 1 ? 'primary' : 'secondary'}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))} */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperPurchaseModal;
