import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import MillMasterPage from "./components/mill/MillMaster";
import ShadeMasterPage from "./components/shade/ShadeMaster";
import PaperMasterFind from "./components/paper/PaperMaster";
import PaperDashboard from "./components/paperDasbhboard/paperDashboard";
import Logout from "./components/auth/Logout";
import PolytheneRawMaterial from "./components/polythene/PolytheneRawMaterial";
import DisposablePlates from "./components/DisposablePlates/DisposabePlates";
import Store from "./components/Store/Store";
import ResetPassword from "./components/auth/ResetPassword";
import PaperOutPage from "./components/paperDasbhboard/PaperOutPage";
import InventoryPage from "./components/paperDasbhboard/InventoryPage";
import PaperPurchasePage from "./components/paperDasbhboard/paperPurchasePage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mill-master" element={<MillMasterPage />} />
          <Route path="/shade-master" element={<ShadeMasterPage />} />
          <Route path="/master" element={<PaperMasterFind />} />
          <Route path="/paper-raw" element={<PaperDashboard />} />
          <Route path="/polythene-raw" element={<PolytheneRawMaterial />} />
          <Route path="/disposable-plates" element={<DisposablePlates />} />
          <Route path="/store" element={<Store />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/paper-out" element={<PaperOutPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/paper-purchase" element={<PaperPurchasePage />} />

        </Route>

        {/* Optional: Add a catch-all 404 route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
