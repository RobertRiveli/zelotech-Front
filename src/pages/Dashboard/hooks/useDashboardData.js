import { useEffect, useState } from "react";
import { listTodayMedicationAdministrations } from "../../../services/medicationAdministrationService";
import { listMedications } from "../../../services/medicationService";
import { listPrescriptions } from "../../../services/prescriptionService";
import { listResidents } from "../../../services/residentService";
import { getProfile } from "../../../services/userService";

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

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError("");

      const requests = [
        ["profile", getProfile()],
        ["residents", listResidents()],
        ["prescriptions", listPrescriptions()],
        ["medications", listMedications()],
        ["administrations", listTodayMedicationAdministrations()],
      ];

      const settledRequests = await Promise.allSettled(
        requests.map(([, request]) => request),
      );

      if (!isMounted) {
        return;
      }

      const nextData = { ...emptyDashboardData };
      const failedRequests = [];

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

      if (failedRequests.length === requests.length) {
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
    isLoading,
    loadError,
  };
}
