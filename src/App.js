import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import DashboardHome from './components/DashboardHome';
import FinancialManagerPage from "./components/FinancialManagerPage";import ProjectManagePage from './components/ProjectManagePage';
import './App.css';

import ProjectServiceMapPage from './components/ProjectServiceMapPage';
import ServiceIntegrationPage from './components/ServiceIntegrationPage';
import { ServiceProvider } from './contexts/ServiceContext';

function App() {
  return (
    <ServiceProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="project" element={<ProjectManagePage />} />
                <Route path="project-group/:groupId" element={<ProjectServiceMapPage />} />
                <Route path="service/integration" element={<ServiceIntegrationPage />} />
                <Route path="financial" element={<FinancialManagerPage />} />
                {/* Future routes can be added here */}
              </Route>
            </Route>

            {/* Service Integration Route */}
            {/* <Route path="/service/integration" element={
            <ProtectedRoute>
              <ServiceIntegrationPage />
            </ProtectedRoute>
          } /> */ }
          </Routes>
        </div>
      </Router>
    </ServiceProvider>
  );
}

export default App;
