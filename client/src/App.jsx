import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionFeed from './pages/TransactionFeed';
import TransactionDetail from './pages/TransactionDetail';
import ReviewQueue from './pages/ReviewQueue';
import AuditLog from './pages/AuditLog';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/common/Layout';
import Notifications from './pages/Notifications';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionFeed />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/queue" element={<ReviewQueue />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/audit" element={<AuditLog />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
