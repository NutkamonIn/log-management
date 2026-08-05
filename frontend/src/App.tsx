import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// นำเข้าหน้าต่างๆ (ตอนนี้อาจจะยังแดงๆ อยู่เพราะเรายังสร้างไม่ครบ ไม่เป็นไรครับ)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import Investigate from './pages/Investigate';

// ยามเฝ้าประตู: เช็คว่ามี token ไหม ถ้าไม่มีเด้งไป /login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้า Login  */}
        <Route path="/login" element={<Login />} />

        {/* หน้า Dashboard  */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* หน้า Alerts */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* หน้า Logs  */}
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />

        {/* หน้า Investigate  */}
        <Route
          path="/investigate"
          element={
            <ProtectedRoute>
              <Investigate />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
