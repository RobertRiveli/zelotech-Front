import { useEffect, useState } from "react";
import { listTodayMedicationAdministrations } from "@/features/medication-administrations/api/medicationAdministrationService";
import { listMedications } from "@/features/medications/api/medicationService";
import { listPrescriptions } from "@/features/prescriptions/api/prescriptionService";
import { listResidents } from "@/features/residents/api/residentService";
import { getProfile } from "@/features/auth/api/userService";
import { getUserRole } from "@/features/auth/utils/session";

const emptyDashboardData = {
  profile: null,
  residents: [],
  prescriptions: [],
  medications: [],
  administrations: [],
};

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [failedRequests, setFailedRequests] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError("");
      setFailedRequests([]);

      const nextData = { ...emptyDashboardData };
      const failedRequests = [];

      try {
        nextData.profile = await getProfile();
      } catch {
        failedRequests.push("profile");
      }

      const role = nextData.profile?.role ?? getUserRole();
      const requests = [
        ["prescriptions", listPrescriptions()],
        ["medications", listMedications()],
        ["administrations", listTodayMedicationAdministrations()],
      ];

      if (role === "admin") {
        requests.push(["residents", listResidents()]);
      }
      const totalRequestCount = requests.length + 1;

      const settledRequests = await Promise.allSettled(
        requests.map(([, request]) => request),
      );

      if (!isMounted) {
        return;
      }

      settledRequests.forEach((result, index) => {
        const [key] = requests[index];

        if (result.status === "fulfilled") {
          nextData[key] = result.value;
          return;
        }

        failedRequests.push(key);
      });

      setDashboardData(nextData);
      setIsLoading(false);
      setFailedRequests(failedRequests);

      if (failedRequests.length === totalRequestCount) {
        setLoadError("Não foi possível carregar os dados do dashboard.");
        return;
      }

      if (failedRequests.length > 0) {
        setLoadError("Algumas informações não puderam ser carregadas agora.");
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dashboardData,
    failedRequests,
    isLoading,
    loadError,
    setDashboardData,
  };
}
