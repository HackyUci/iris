import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoutes";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import SelectRole from "./pages/SelectRole";
import MerchantDashboard from "./pages/MerchantDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import InputMerchantName from "./pages/InputMerchantName";
import MerchantQRCode from "./pages/MerchantQrCode";
import MerchantProfile from "./pages/MerchantProfile";
import MerchantHistory from "./pages/MerchantHistory";
import MerchantCashout from "./pages/MerchantCashout";
import MerchantSeeQrCode from "./pages/MerchantSeeQrCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <SelectRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/input-merchant-name"
          element={
            <ProtectedRoute>
              <InputMerchantName />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantQRCode />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant-profile"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant-history"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant-cashout"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantCashout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merchant-see-qr-code"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantSeeQrCode />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer"
          element={
            <ProtectedRoute requireRole="Customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
