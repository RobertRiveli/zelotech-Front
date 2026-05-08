import { Navigate, Route, Routes } from "react-router-dom";
import CompanyRegisterPage from "../pages/CompanyRegisterPage";
import DashboardPage from "../pages/Dashboard";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import { hasAdminSession } from "../utils/storage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro-empresa" element={<CompanyRegisterPage />} />
      <Route path="/cadastro-instituicao" element={<CompanyRegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

function AdminRoute({ children }) {
  if (!hasAdminSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AppRoutes;
