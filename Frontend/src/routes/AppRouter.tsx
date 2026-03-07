
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import AppLayout from '../layouts/AppLayout';
import HospitalDashboard from '../pages/dashboards/HospitalDashboard';
import WarRoomDashboard from '../pages/war-room/WarRoomDashboard'; // 1. Add this import
import BloodBankDashboard from '../pages/dashboards/BloodBankDashboard';
import DonorPortal from '../pages/dashboards/DonorPortal';
import CourierDashboard from '../pages/dashboards/CourierDashboard';
import NurseScanner from '../pages/dashboards/NurseScanner';
import AdminSuperPanel from '../pages/dashboards/AdminSuperPanel';
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        {/* 2. Add the War Room route here */}
        <Route path="/war-room" element={<WarRoomDashboard />} /> 
        <Route path="/blood-bank" element={<BloodBankDashboard />} />
        <Route path="/donor" element={<DonorPortal />} />
        <Route path="/courier" element={<CourierDashboard />} />
        <Route path="/scanner" element={<NurseScanner />} />
        <Route path="/admin" element={<AdminSuperPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}