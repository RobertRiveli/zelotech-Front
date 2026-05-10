import { BrowserRouter } from "react-router-dom";
import { getToken } from "@/features/auth/utils/session";
import { configureApiClient } from "@/shared/api/client";

configureApiClient({ getToken });

export function AppProviders({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
