import { useEffect, useState } from "react";

function useActiveSection(links, offset = 120) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const updateActiveSection = () => {
      const current = links.reduce((visibleSection, link) => {
        const section = document.querySelector(link.href);

        if (section && window.scrollY >= section.offsetTop - offset) {
          return section.id;
        }

        return visibleSection;
      }, "");

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [links, offset]);

  return activeSection;
}

export default useActiveSection;
