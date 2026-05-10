import { useLayoutEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { SESSION_EXPIRED_MESSAGE } from "@/features/auth/constants/accessMessages";
import { getToken, removeSession } from "@/features/auth/utils/session";
import { configureApiClient } from "@/shared/api/client";

configureApiClient({ getToken });

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <SessionExpirationHandler />
      {children}
    </BrowserRouter>
  );
}

function SessionExpirationHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    configureApiClient({
      getToken,
      onAuthenticationError() {
        removeSession();

        if (location.pathname === "/login") {
          return;
        }

        navigate("/login", {
          replace: true,
          state: { authMessage: SESSION_EXPIRED_MESSAGE },
        });
      },
    });
  }, [location.pathname, navigate]);

  return null;
}
