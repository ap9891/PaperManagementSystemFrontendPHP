import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./paperDashboard.css";
import Navigation from "../navbar/Navbar";
import PaperPurchaseModal from "./paperPurchase";
import PaperOutModal from "./paperOut";
import InventoryModal from "./Inventory";

const PaperDashboard = () => {
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaperOutModalOpen, setIsPaperOutModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const handlePaperInClick = (e) => {
    e.preventDefault();
    setIsPaperModalOpen(true);
  };

  const handlePaperOutClick = (e) => {
    e.preventDefault();
    setIsPaperOutModalOpen(true);
  };

  const handleInventoryClick = (e) => {
    e.preventDefault();
    setIsInventoryOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div>
        <Navigation />
      </div>

      <div className="main-content">
        <div className="date-display">
          <div>
            {currentTime.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
        </div>

        <h1 className="main-title">Fantasy Packaging Private Limited</h1>

        <div className="buttons-grid">
          <Link to="/paper-purchase" >
            Paper In
          </Link>

          <Link to="/paper-out" >
            Paper Out
          </Link>

          <Link to="/inventory" >
            Open Inventory
          </Link>
        </div>

        {/* <PaperOutModal
          isOpen={isPaperOutModalOpen}
          onClose={() => setIsPaperOutModalOpen(false)}
        /> */}

        <PaperPurchaseModal
          isOpen={isPaperModalOpen}
          onClose={() => setIsPaperModalOpen(false)}
        />

        <InventoryModal
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
        />
      </div>
    </div>
  );
};

export default PaperDashboard;
