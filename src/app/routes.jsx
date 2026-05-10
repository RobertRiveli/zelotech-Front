import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import CompanyRegisterPage from "@/features/company/pages/CompanyRegisterPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import HomePage from "@/features/landing/pages/HomePage";
import { hasAdminSession } from "@/shared/utils/storage";

export function AppRoutes() {
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
