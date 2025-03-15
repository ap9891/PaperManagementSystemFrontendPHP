import React, { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../../config/config";
// import Navigation from "../navbar/Navbar";
import NavigationPaperDashboard from "../navbar/NavbarPaperDashboard";
import './inventory.css';

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [stockOutHistory, setStockOutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFilters, setSearchFilters] = useState({
    paperName: "",
    reelNumber: "",
    millName: "",
    shadeName: "",
    startDate: "",
    endDate: ""
  });

  const naturalSortReel = (a, b) => {
    const extractParts = (reel) => {
      const match = reel.match(/([a-zA-Z-]+)(\d+)/);
      return match 
        ? { prefix: match[1], number: parseInt(match[2], 10) }
        : { prefix: reel, number: 0 };
    };
  
    const aParts = extractParts(a);
    const bParts = extractParts(b);
  
    if (aParts.prefix !== bParts.prefix) {
      return aParts.prefix.localeCompare(bParts.prefix);
    }
  
    return aParts.number - bParts.number;
  };



  // useEffect(() => {
  //   fetchInitialData();
  //   fetchStockOutHistory();
  // }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const processSortedData = (items) => {
    if (!sortColumn) return items;

    return [...items].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      if (['quantityLeft', 'days', 'ratePerKg', 'totalPrice'].includes(sortColumn)) {
        valueA = Number(valueA);
        valueB = Number(valueB);
      }
      else if(sortColumn === 'reelNumber') {
        const sortMultiplier = sortDirection === 'asc' ? 1 : -1;
        return sortMultiplier * naturalSortReel(a[sortColumn], b[sortColumn]);
      }
      else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };



  const processedData = processSortedData(inventoryData);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  



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

  // const fetchInitialData = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     // Fetch both inventory and stock out history data simultaneously
  //     const [inventoryResponse, historyResponse] = await Promise.all([
  //       axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
  //         params: { searchTerm: "" },
  //       }),
  //       axios.get(API_ENDPOINTS.REELS.HISTORY)
  //     ]);

  //     const inventoryData = Array.isArray(inventoryResponse.data)
  //       ? inventoryResponse.data
  //       : inventoryResponse.data.data || [];

  //     setStockOutHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      
  //     // Process inventory data with stock out history
  //     const processedData = processInventoryData(inventoryData);
  //     setInventoryData(processedData);
  //   } catch (err) {
  //     setError("Failed to fetch inventory data");
  //     console.error("Error fetching inventory:", err);
  //     setInventoryData([]);
  //     setStockOutHistory([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  useEffect(() => {
    handleSearch();
  }, [searchFilters]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
        params: searchFilters
      });
      
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const processedData = processInventoryData(data);
      setInventoryData(processedData);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to perform search");
      console.error("Search error:", err);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (filters = null) => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch both inventory and stock out history
      const [inventoryResponse, historyResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.INVENTORY.SEARCH, {
          params: filters || {}
        }),
        axios.get(API_ENDPOINTS.REELS.HISTORY)
      ]);

      const inventoryData = Array.isArray(inventoryResponse.data)
        ? inventoryResponse.data
        : inventoryResponse.data.data || [];

      const historyData = Array.isArray(historyResponse.data) 
        ? historyResponse.data 
        : [];

      setStockOutHistory(historyData);
      
      // Process inventory data with latest stock out history
      const processedData = processInventoryData(inventoryData, historyData);
      setInventoryData(processedData);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
      setInventoryData([]);
      setStockOutHistory([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (Object.values(searchFilters).some(value => value !== "")) {
      fetchData(searchFilters);
    }
  }, [searchFilters]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // const calculateTotals = () => {
  //   // Calculate totals from the processed inventory data
  //   // This ensures we're using the current state of inventory after stock-outs
  //   return processedData.reduce(
  //     (acc, item) => {
  //       // Get actual quantity left by subtracting used quantity
  //       const quantityUsed = stockOutHistory
  //         .filter((history) => history.reel_number === item.reelNumber)
  //         .reduce((total, history) => total + (Number(history.quantity_used) || 0), 0);
        
  //       const quantityLeft = Number(item.quantity) - quantityUsed;
        
  //       // Calculate value based on remaining quantity
  //       const itemValue = quantityLeft * Number(item.ratePerKg);

  //       return {
  //         totalQuantity: acc.totalQuantity + quantityLeft,
  //         totalValue: acc.totalValue + itemValue
  //       };
  //     },
  //     { totalQuantity: 0, totalValue: 0 }
  //   );
  // };

  const calculateTotals = () => {
    return inventoryData.reduce(
      (acc, item) => ({
        totalQuantity: acc.totalQuantity + item.quantityLeft,
        totalValue: acc.totalValue + item.totalPrice
      }),
      { totalQuantity: 0, totalValue: 0 }
    );
  };

  const processInventoryData = (inventoryItems, history) => {
    return inventoryItems.map((item) => {
      const quantityUsed = history
        .filter((record) => record.reel_number === item.reelNumber)
        .reduce((total, record) => total + Number(record.quantity_used), 0);
      
      const quantityLeft = Number(item.quantity) - quantityUsed;
      const totalPrice = quantityLeft * Number(item.ratePerKg);
      const status = quantityUsed > 0 ? "Used" : "Fresh";

      return {
        ...item,
        quantityUsed,
        quantityLeft,
        totalPrice,
        status
      };
    }).filter(item => item.quantityLeft > 0);
  };


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
 
   // Handling sort
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
   const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setSearchFilters({
      paperName: "",
      reelNumber: "",
      millName: "",
      shadeName: "",
      startDate: "",
      endDate: ""
    });
    fetchData(); // Fetch fresh data without filters
  };

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
  return (
    <div>
      <NavigationPaperDashboard />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl text-2xl-inventory font-bold mb-4">Inventory Management</h1>

        <div style={containerStyle}>
              <div style={searchGridStyle}>
                {/* Paper Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Paper Name"
                    style={inputStyle}
                    value={searchFilters.paperName}
                    onChange={(e) =>
                      handleInputChange("paperName", e.target.value)
                    }
                  />
                </div>

                {/* Mill Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Mill Name"
                    style={inputStyle}
                    value={searchFilters.millName}
                    onChange={(e) =>
                      handleInputChange("millName", e.target.value)
                    }
                  />
                </div>

                {/* Shade Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Shade Name"
                    style={inputStyle}
                    value={searchFilters.shadeName}
                    onChange={(e) =>
                      handleInputChange("shadeName", e.target.value)
                    }
                  />
                </div>

                {/* Reel Number */}
                <div>
                  <input
                    type="text"
                    placeholder="Search by Reel Number"
                    style={inputStyle}
                    value={searchFilters.reelNumber}
                    onChange={(e) =>
                      handleInputChange("reelNumber", e.target.value)
                    }
                  />
                </div>

                {/* Date Range */}
                <div style={dateContainerStyle}>
                  <input
                    type="date"
                    style={inputStyle}
                    value={searchFilters.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    style={inputStyle}
                    value={searchFilters.endDate}
                    min={searchFilters.startDate} // This ensures end date can't be before start date
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    disabled={!searchFilters.startDate} // Disable end date until start date is selected
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

        <div className="overflow-x-auto table-container-inventory">
          <table className="w-full border-collapse">
          <thead>
              <tr>
              <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon column="status" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('reelNumber')}
                >
                  Reel Number <SortIcon column="reelNumber" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('paperName')}
                >
                  Paper Name <SortIcon column="paperName" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('quantityLeft')}
                >
                  Qty Left(kg) <SortIcon column="quantityLeft" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('millName')}
                >
                  Mill Name <SortIcon column="millName" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('shade')}
                >
                  Shade <SortIcon column="shade" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('days')}
                >
                  Days <SortIcon column="days" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('ratePerKg')}
                >
                 Rate/kg(₹) <SortIcon column="ratePerKg" />
                </th>
                <th 
                  className="border p-2 cursor-pointer" 
                  onClick={() => handleSort('totalPrice')}
                >
                  Value(₹) <SortIcon column="totalPrice" />
                </th>
                <th className="border p-2">Remark</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={item.quantityLeft === 0 ? "bg-red-50" : ""}
                >
                  <td className="border p-2">
                    <span className={`status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="border p-2">{item.reelNumber}</td>
                  <td className="border p-2">{item.paperName}</td>
                  <td className="border p-2 font-medium text-blue-600">
                    {item.quantityLeft}
                  </td>
                  <td className="border p-2">{item.millName}</td>
                  <td className="border p-2">{item.shade}</td>
                  <td className="border p-2">{item.days}</td>
                  <td className="border p-2">{item.ratePerKg.toFixed(2)}</td>
                  <td className="border p-2 font-medium text-green-600">
                    {item.totalPrice.toFixed(2)}
                  </td>
                  <td className="border p-2">{item.remark || "-"}</td>
                </tr>
              ))}
              {(!Array.isArray(inventoryData) || inventoryData.length === 0) &&
                !loading && (
                  <tr>
                    <td colSpan="10" className="text-center p-4">
                      No inventory data found
                    </td>
                  </tr>
                )}
            </tbody>

          </table>
        </div>

        {/* Pagination Controls */}
        {inventoryData.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              style={{ width: "50px", height: "30px" }}
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
            >
              <span className="material-icons">chevron_left</span>
            </button>

            <div className="text-sm text-gray-700 w-44 text-center">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </div>

            <button
              style={{ width: "50px", height: "30px" }}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center"
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>

        )}
      </div>
    </div>
  );
};

export default InventoryPage;