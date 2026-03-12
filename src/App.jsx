import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Navbar from './components/Common/Navbar';
import AdminDashboard from './components/Dashboard/AdminDashBoard';
import POSInterface from './components/Orders/POSInterface';
import OrderQueue from './components/Orders/OrderQueue';
import MenuList from './components/Menu/MenuList';
import './App.css';
import './index.css' 
import "tailwindcss" 

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-100">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <AdminDashboard />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pos"
                element={
                  <ProtectedRoute requiredRole="cashier">
                    <>
                      <Navbar />
                      <POSInterface />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders/queue"
                element={
                  <ProtectedRoute requiredRole="cashier">
                    <>
                      <Navbar />
                      <OrderQueue />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/menu"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <>
                      <Navbar />
                      <MenuList />
                    </>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <>
                      <Navbar />
                      <AdminDashboard />
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;