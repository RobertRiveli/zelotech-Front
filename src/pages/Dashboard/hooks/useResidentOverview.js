import { useEffect, useState } from "react";
import { getResidentOverview } from "../../../services/residentService";

export function useResidentOverview({
  activeItem,
  filteredResidents,
  selectedResidentId,
}) {
  const [residentOverviews, setResidentOverviews] = useState({});
  const [residentOverviewStatus, setResidentOverviewStatus] = useState({
    residentId: "",
    isLoading: false,
    error: "",
  });
  const selectedResidentIsVisible = filteredResidents.some(
    (resident) => resident.id === selectedResidentId,
  );
  const visibleSelectedResidentId = selectedResidentIsVisible
    ? selectedResidentId
    : filteredResidents[0]?.id ?? "";
  const selectedResidentOverview = visibleSelectedResidentId
    ? residentOverviews[visibleSelectedResidentId]
    : null;
  const selectedOverviewStatus =
    residentOverviewStatus.residentId === visibleSelectedResidentId
      ? residentOverviewStatus
      : { residentId: visibleSelectedResidentId, isLoading: false, error: "" };

  useEffect(() => {
    if (
      activeItem !== "Residentes" ||
      !visibleSelectedResidentId ||
      selectedResidentOverview
    ) {
      return undefined;
    }

    let isMounted = true;

    async function loadResidentOverview() {
      setResidentOverviewStatus({
        residentId: visibleSelectedResidentId,
        isLoading: true,
        error: "",
      });

      try {
        const overview = await getResidentOverview(visibleSelectedResidentId);

        if (!isMounted) {
          return;
        }

        setResidentOverviews((currentOverviews) => ({
          ...currentOverviews,
          [visibleSelectedResidentId]: overview,
        }));
        setResidentOverviewStatus({
          residentId: visibleSelectedResidentId,
          isLoading: false,
          error: "",
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setResidentOverviewStatus({
          residentId: visibleSelectedResidentId,
          isLoading: false,
          error: "Não foi possível carregar a visão geral do residente.",
        });
      }
    }

    loadResidentOverview();

    return () => {
      isMounted = false;
    };
  }, [activeItem, visibleSelectedResidentId, selectedResidentOverview]);

  return {
    selectedOverviewStatus,
    selectedResidentOverview,
    visibleSelectedResidentId,
  };
}
