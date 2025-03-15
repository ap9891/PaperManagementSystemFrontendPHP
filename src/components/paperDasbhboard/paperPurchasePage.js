import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./PaperPurchase.css";
import Alert from "../Alert/Alert";
import API_ENDPOINTS from "../../config/config";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
import { useNavigate } from "react-router-dom";
import ComboboxInput from "./comboBoxInput";

const PaperPurchasePage = () => {
    const initialFormState = {
        date: new Date().toISOString().split("T")[0],
        reelNumber: "",
        paperName: "",
        quantity: "",
        millName: "",
        shade: "",
        ratePerKg: "",
        price: "",
        remark: "",
      };
    
  const [activeTab, setActiveTab] = useState("new");
  const [formData, setFormData] = useState(initialFormState);
  
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

  const navigate = useNavigate();

  const generateReelNumber = useCallback(async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.PAPER_PURCHASES.GENERATE_REEL
      );
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


  const fetchInitialData = async () => {
    try {
      const [paperResponse, millResponse, shadeResponse, purchasesResponse] =
        await Promise.all([
          axios.get(`${API_ENDPOINTS.PAPER}/read.php`),
          axios.get(API_ENDPOINTS.MILL),
          axios.get(API_ENDPOINTS.SHADE),
          axios.get(API_ENDPOINTS.PAPER_PURCHASES.READ),
        ]);

      const paperNames = paperResponse.data.map((paper) => ({
        value: paper.part_name,
        label: `${paper.part_name} (${paper.gsm} GSM, ${paper.type})`,
        ...paper,
      }));

      const millNames = millResponse.data.map((mill) => ({
        value: mill.mill_name,
        label: mill.mill_name,
        id: mill.mill_id,
      }));

      const shades = shadeResponse.data.map((shade) => ({
        value: shade.shadeName,
        label: shade.shadeName,
        id: shade.shadeId,
      }));

      const calculatedTotals = purchasesResponse.data.reduce(
        (acc, curr) => {
          return {
            totalQuantity: acc.totalQuantity + parseFloat(curr.quantity || 0),
            totalPrice: acc.totalPrice + parseFloat(curr.price || 0),
          };
        },
        { totalQuantity: 0, totalPrice: 0 }
      );

      setPaperMasterData(paperNames);
      setMillMasterData(millNames);
      setShadeMasterData(shades);
      setHistory(purchasesResponse.data);
      setTotals(calculatedTotals);

      const reelNumber = await generateReelNumber();
      setFormData((prev) => ({
        ...prev,
        reelNumber: reelNumber,
        date: new Date().toISOString().split("T")[0],
      }));
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setAlert({
        type: "error",
        message: "Failed to load initial data",
      });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [generateReelNumber, activeTab]);

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

  const handleCancel = async () => {
    const newReelNumber = await generateReelNumber();
    setFormData({
      ...initialFormState,
      date: new Date().toISOString().split("T")[0],
      reelNumber: newReelNumber
    });
    
    // Optional: You might want to add a soft notification
    setAlert({
      type: "info",
      message: "Form reset to initial state"
    });
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [paperResponse, millResponse, shadeResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.PAPER}/read.php`),
          axios.get(API_ENDPOINTS.MILL),
          axios.get(API_ENDPOINTS.SHADE),
        ]);
        
        // Transform data (same as modal version)
        const paperNames = paperResponse.data.map((paper) => ({
          value: paper.part_name,
          label: `${paper.part_name} (${paper.gsm} GSM, ${paper.type})`,
          ...paper,
        }));

        const millNames = millResponse.data.map((mill) => ({
          value: mill.mill_name,
          label: mill.mill_name,
          id: mill.mill_id,
        }));

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
        const response = await axios.get(API_ENDPOINTS.PAPER_PURCHASES.READ);
        
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

    fetchMasterData();
    fetchPurchaseHistory();
  }, []);

  // Generate Reel Number
  // Rest of the methods remain the same as in the modal version
  // (handleInputChange, validateForm, handleSave, etc.)
  // Only change: Remove `isOpen` and `onClose` dependencies
  // Update useEffect for reel number generation
  useEffect(() => {
    const fetchReelNumber = async () => {
    //   if (isOpen) {
        const reelNumber = await generateReelNumber();
        setFormData((prev) => ({
          ...prev,
          date: new Date().toISOString().split("T")[0],
          reelNumber: reelNumber,
        }));
    //   }
    };

    fetchReelNumber();
  }, [ generateReelNumber]);

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
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000); 
  
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSave = async (saveAndNext = false) => {
    if (!validateForm()) return;
  
    try {
      const response = await axios.post(
        API_ENDPOINTS.PAPER_PURCHASES.CREATE,
        formData
      );
      const savedPurchase = response.data;
  
      setHistory((prev) => [savedPurchase, ...prev]);
  
      // Ensure alert is set
      setAlert({
        type: "success",
        message: "Paper purchase record saved successfully"
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
          ...initialFormState,
          reelNumber: newReelNumber,
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
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchInitialData();
    }
  };

      // Add new state for sorting
      const [sortColumn, setSortColumn] = useState(null);
      const [sortDirection, setSortDirection] = useState('asc');
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
      const processPurchases = () => {
          let processedHistory = [...history];
  
          if (sortColumn) {
              processedHistory.sort((a, b) => {
                  let valueA = a[sortColumn];
                  let valueB = b[sortColumn];
  
                  // Handle numeric sorting for quantity, rate_per_kg, price
                  const numericColumns = ['quantity', 'rate_per_kg', 'price'];
                  if (numericColumns.includes(sortColumn)) {
                      valueA = parseFloat(valueA || 0);
                      valueB = parseFloat(valueB || 0);
                  } 
                  // Handle date sorting
                  else if (sortColumn === 'date') {
                      valueA = new Date(valueA);
                      valueB = new Date(valueB);
                  }
                  else if(sortColumn === 'reel_number')
                  {
                    const sortMultiplier = sortDirection === 'asc' ? 1 : -1;
                    return sortMultiplier * naturalSortReel(a[sortColumn], b[sortColumn]);
                  }
                  // Handle string sorting for other columns
                  else if (typeof valueA === 'string') {
                      valueA = (valueA || '').toLowerCase();
                      valueB = (valueB || '').toLowerCase();
                  }
  
                  if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
                  if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
                  return 0;
              });
          }
  
          return processedHistory;
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
            return <span className="ml-2 text-gray-300">↕️</span>;
        }
        return sortDirection === 'asc' ? '⬆️' : '⬇️';
    };
    const processedHistory = processPurchases();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedHistory.length / itemsPerPage);


  return (
    <div >
        <NavigationPaperDashboard/>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
        //   onClose={() => setAlert(null)}
        />
      )}
      <div className="page-content">
        <div className="page-header">
          {/* <h2>Paper Purchase</h2> */}
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "new" ? "active" : ""}`}
            onClick={() => handleTabChange("new")}
          >
            New
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => handleTabChange("history")}
          >
            History
          </button>
        </div>

        {/* Render the form and history table as before, 
            but remove modal-specific styling */}
        {/* The content will be mostly the same as the modal version */}
        {activeTab === "new" ? (
          <div className="form-content form-content-paperPurchase">
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
{/* 
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
              </div> */}
              <div className="form-group">
  <ComboboxInput
    options={paperMasterData}
    value={formData.paperName}
    onChange={(value) => handleInputChange("paperName", value)}
    placeholder="Select or type paper name"
    label="Paper Name"
    required={true}
  />
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

              {/* <div className="form-group">
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
              </div> */}
              <div className="form-group">
  <ComboboxInput
    options={millMasterData}
    value={formData.millName}
    onChange={(value) => handleInputChange("millName", value)}
    placeholder="Select or type mill name"
    label="Mill Name"
    required={true}
  />
</div>


              {/* <div className="form-group">
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
              </div> */}
              <div className="form-group">
  <ComboboxInput
    options={shadeMasterData}
    value={formData.shade}
    onChange={(value) => handleInputChange("shade", value)}
    placeholder="Select or type shade"
    label="Shade"
    required={true}
  />
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
              <button className="button secondary" onClick={handleCancel}>
                Clear
              </button>
              <button
                className="button secondary"
                onClick={() => handleSave()}
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
            <div className="table-container table-container-paperPurchase">
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
                            <th onClick={() => handleSort('date')}>
                                Date <SortIcon column="date" />
                            </th>
                            <th onClick={() => handleSort('reel_number')}>
                                Reel Number <SortIcon column="reel_number" />
                            </th>
                            <th onClick={() => handleSort('paper_name')}>
                                Paper Name <SortIcon column="paper_name" />
                            </th>
                            <th onClick={() => handleSort('quantity')}>
                                Quantity (kg) <SortIcon column="quantity" />
                            </th>
                            <th onClick={() => handleSort('mill_name')}>
                                Mill Name <SortIcon column="mill_name" />
                            </th>
                            <th onClick={() => handleSort('shade')}>
                                Shade <SortIcon column="shade" />
                            </th>
                            <th onClick={() => handleSort('rate_per_kg')}>
                                Rate/kg (₹) <SortIcon column="rate_per_kg" />
                            </th>
                            <th onClick={() => handleSort('price')}>
                                Price (₹) <SortIcon column="price" />
                            </th>
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
                      <td>{entry.rate_per_kg}</td>
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

export default PaperPurchasePage;