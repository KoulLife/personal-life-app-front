import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import DashboardHome from './components/DashboardHome';
import ProjectManagePage from './components/ProjectManagePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="project" element={<ProjectManagePage />} />
              {/* Future routes can be added here */}
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
