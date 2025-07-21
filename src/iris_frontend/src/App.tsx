import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import LoginPage from './pages/LoginPage';
import SelectRole from './pages/SelectRole';
import MerchantDashboard from './pages/MerchantDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import './index.css';

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
          path="/merchant"
          element={
            <ProtectedRoute requireRole="Merchant">
              <MerchantDashboard />
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