// hooks/useApi.js
import { useSweetAlert } from "./useSweetAlert";
import axios from "axios";
import { useMemo, useCallback } from "react";
import env from "../config/env";

export const useApi = (colocarAlertas = false) => {
  const alert = useSweetAlert();

  // Tipos de respuesta esperados según tu backend
  const RESPONSE_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
    VALIDATION_ERROR: "validation_error",
  };

  // Mover showAutoAlert a useCallback para que sea estable
  const showAutoAlert = useCallback(
    (response) => {
      if (!colocarAlertas) {
        console.log("Alertas automáticas desactivadas");
        return;
      }

      console.log("showAutoAlert recibió:", response);

      const config = {
        success: {
          icon: "success",
          confirmButtonColor: "#10b981",
        },
        error: {
          icon: "error",
          confirmButtonColor: "#ef4444",
        },
        validation_error: {
          icon: "error",
          confirmButtonColor: "#ef4444",
        },
        warning: {
          icon: "warning",
          confirmButtonColor: "#f59e0b",
        },
        info: {
          icon: "info",
          confirmButtonColor: "#3b82f6",
        },
      }[response.type] || { icon: "info" };

      let title = response.title;
      let message = response.message;

      // Manejar errores de validación del FormatterResponseController
      if (
        response.type === RESPONSE_TYPES.VALIDATION_ERROR &&
        response.error &&
        response.error.details && // Cambio aquí para la nueva estructura
        response.error.details.validationErrors &&
        response.error.details.validationErrors.length > 0
      ) {
        console.log(
          `Mostrando ${response.error.details.validationErrors.length} errores de validación`
        );

        response.error.details.validationErrors.forEach((error, index) => {
          setTimeout(() => {
            const errorTitle = error.field
              ? error.field
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "Error";

            alert.toast({
              title: errorTitle,
              message: error.message || "Error de validación",
              config: {
                position: "bottom-end",
                timer: 3000,
                ...config,
              },
            });
          }, index * 500); // Reducido a 500ms entre toasts
        });
      }
      // Manejar errores de validación del formato anterior (backward compatibility)
      else if (
        response.type === RESPONSE_TYPES.VALIDATION_ERROR &&
        response.error &&
        Array.isArray(response.error)
      ) {
        response.error.forEach((error, index) => {
          setTimeout(() => {
            const errorTitle =
              error.path || error.field
                ? (error.path || error.field)
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "Error";

            alert.toast({
              title: errorTitle,
              message: error.message || "Error de validación",
              config: {
                position: "bottom-end",
                timer: 3000,
                ...config,
              },
            });
          }, index * 500);
        });
      } else {
        // Para otros tipos de error
        alert.show({
          title: title || "Error",
          text: message || "Ha ocurrido un error",
          ...config,
        });
      }
    },
    [alert, colocarAlertas]
  );

  // ... (showAlert y showToast se mantienen igual)

  // Funciones auxiliares mejoradas
  const getHttpErrorMessage = (status) => {
    const messages = {
      400: "Solicitud incorrecta",
      401: "No autorizado",
      403: "Acceso prohibido",
      404: "Recurso no encontrado",
      409: "Conflicto de datos",
      422: "Entidad no procesable",
      429: "Demasiadas solicitudes",
      500: "Error interno del servidor",
      502: "Bad Gateway",
      503: "Servicio no disponible",
    };
    return messages[status] || `Error HTTP ${status}`;
  };

  const getHttpErrorTitle = (status) => {
    const titles = {
      400: "Solicitud Incorrecta",
      401: "No Autorizado",
      403: "Acceso Denegado",
      404: "No Encontrado",
      409: "Conflicto",
      422: "Validación Fallida",
      429: "Límite Excedido",
      500: "Error del Servidor",
    };
    return titles[status] || "Error";
  };

  // Crear instancia de axios con useMemo - VERSIÓN MEJORADA
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.serverUrl,
      timeout: 30000,
      withCredentials: true,
    });

    // Interceptor de respuesta MEJORADO para FormatterResponseController
    instance.interceptors.response.use(
      (response) => {
        const backendResponse = response.data;

        if (backendResponse && typeof backendResponse === "object") {
          // Caso 1: Respuesta de éxito del FormatterResponseController
          if (backendResponse.success === true) {

            // Devolver los datos directamente para fácil acceso
            return backendResponse.data || null;
          }

          // Caso 2: Respuesta de error del FormatterResponseController
          if (backendResponse.success === false) {
            const errorType =
              backendResponse.error?.code === "VALIDATION_ERROR"
                ? RESPONSE_TYPES.VALIDATION_ERROR
                : RESPONSE_TYPES.ERROR;

            const errorResponse = {
              type: errorType,
              status: backendResponse.status || response.status,
              title: backendResponse.title || "Error",
              message: backendResponse.message || "Error en la operación",
              data: backendResponse.data || null,
              error: backendResponse.error || null,
              originalResponse: response,
              // Información adicional para debugging
              _backendStructure: "FormatterResponseController",
            };

            console.log("❌ Error del backend formateado:", errorResponse);

            // Llamar showAutoAlert
            showAutoAlert(errorResponse);

            return Promise.reject(errorResponse);
          }
        }

        // Caso 3: Respuesta sin formato esperado (fallback)
        console.warn("⚠️ Respuesta sin formato esperado:", backendResponse);
        return backendResponse;
      },
      (error) => {
        // Manejar errores de red, timeout, o respuestas HTTP de error
        let formattedError = {
          type: RESPONSE_TYPES.ERROR,
          status: error.response?.status || 500,
          title: "Error",
          message: "Error de conexión",
          data: null,
          error: null,
          originalError: error,
          _backendStructure: "unknown",
        };

        // Clasificar el tipo de error
        if (error.code === "ECONNABORTED") {
          formattedError.message = "Timeout: La solicitud tardó demasiado";
          formattedError.title = "Timeout";
        } else if (error.response) {
          // El backend respondió con un error HTTP
          const backendError = error.response.data;

          // Si el error viene de tu FormatterResponseController
          if (
            backendError &&
            typeof backendError === "object" &&
            backendError.success === false
          ) {
            formattedError.type =
              backendError.error?.code === "VALIDATION_ERROR"
                ? RESPONSE_TYPES.VALIDATION_ERROR
                : RESPONSE_TYPES.ERROR;
            formattedError.status = backendError.status;
            formattedError.title = backendError.title || "Error";
            formattedError.message =
              backendError.message || "Error en el servidor";
            formattedError.error = backendError.error;
            formattedError.data = backendError.data;
            formattedError._backendStructure = "FormatterResponseController";
          }
          // Si el error es de validación en formato array (backward compatibility)
          else if (backendError && Array.isArray(backendError)) {
            formattedError.type = RESPONSE_TYPES.VALIDATION_ERROR;
            formattedError.title = "Error de Validación";
            formattedError.message = "Los datos enviados no son válidos";
            formattedError.error = backendError;
            formattedError._backendStructure = "legacy_array";
          }
          // Error HTTP genérico
          else {
            formattedError.message = getHttpErrorMessage(error.response.status);
            formattedError.title = getHttpErrorTitle(error.response.status);
            formattedError._backendStructure = "http_error";
          }
        } else if (error.request) {
          // Error de red (sin respuesta)
          formattedError.message = "No se pudo conectar con el servidor";
          formattedError.title = "Error de Conexión";
          formattedError._backendStructure = "network_error";
        }

        console.log("Error formateado:", formattedError);

        // Mostrar alerta de error automáticamente
        showAutoAlert(formattedError);

        return Promise.reject(formattedError);
      }
    );

    // Métodos auxiliares MEJORADOS
    instance.responseTypes = RESPONSE_TYPES;

    instance.isSuccess = (response) => {
      // Para respuestas del FormatterResponseController
      return response && response.success === true;
    };

    instance.isError = (response) => {
      return response && response.success === false;
    };

    instance.isValidationError = (error) => {
      return (
        error.type === RESPONSE_TYPES.VALIDATION_ERROR ||
        error.error?.code === "VALIDATION_ERROR"
      );
    };

    instance.getValidationMessages = (error) => {
      // Para el nuevo formato FormatterResponseController
      if (
        error.error &&
        error.error.details &&
        error.error.details.validationErrors
      ) {
        return error.error.details.validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");
      }
      // Para formato legacy
      if (error.error && Array.isArray(error.error)) {
        return error.error
          .map((err) => `${err.path || err.field}: ${err.message}`)
          .join(", ");
      }
      return error.message;
    };

    // Método para extraer datos de respuesta exitosa
    instance.extractData = (response) => {
      return response?.data || response;
    };

    // Método para verificar si las alertas automáticas están activas
    instance.areAlertsEnabled = () => colocarAlertas;

    return instance;
  }, [alert, showAutoAlert, RESPONSE_TYPES, colocarAlertas]);

  return axiosInstance;
};

export default useApi;
