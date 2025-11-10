// src/hooks/useTour.js
import introJs from "intro.js";
import "intro.js/introjs.css";

/**
 * Hook reutilizable para mostrar tours interactivos con Intro.js
 * @param {Array} steps - Lista de pasos [{ element, intro, position }]
 * @param {string} storageKey - Clave de almacenamiento local (única por módulo)
 * @param {Object} options - Opciones adicionales de Intro.js
 */
export function useTour(steps, storageKey = "tourUPTAMCA", options = {}) {
  const startTour = () => {
    try {
      // Verifica si el usuario ya vio el tour
      const yaVisto = localStorage.getItem(storageKey);

      if (!yaVisto) {
        const intro = introJs();

        intro.setOptions({
          steps,
          showProgress: true,
          showStepNumbers: false,
          showBullets: true,
          exitOnOverlayClick: false,
          nextLabel: "Siguiente →",
          prevLabel: "← Anterior",
          doneLabel: "Finalizar",
          ...options, // permite sobreescribir configuraciones
        });

        // Guarda el estado cuando termina o sale
        intro.oncomplete(() => localStorage.setItem(storageKey, "true"));
        intro.onexit(() => localStorage.setItem(storageKey, "true"));

        intro.start();
      }
    } catch (error) {
      console.error("Error iniciando tour:", error);
    }
  };

  const resetTour = () => {
    // Permite reactivar el tour manualmente
    localStorage.removeItem(storageKey);
    startTour();
  };

  return { startTour, resetTour };
}
