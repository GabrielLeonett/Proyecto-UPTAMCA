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

      console.log("showAutoAlert recibió:", response); // Para debug
      
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

      // Si es error de validación, mostrar lista de errores
      if (
        response.type === RESPONSE_TYPES.VALIDATION_ERROR &&
        response.error &&
        response.error.length > 0
      ) {
        console.log(`Mostrando ${response.error.length} errores de validación`); // Debug
        
        response.error.forEach((error, index) => {
          setTimeout(() => {
            // Corregir el formato del título
            const errorTitle = error.path
              ? error.path
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
                ...config 
              },
            });
          }, index * 3000); // 500ms entre toasts
        });
      } else {
        // Para otros tipos de error
        alert.show({ title: title, text: message, ...config });
      }
    },
    [alert, RESPONSE_TYPES.VALIDATION_ERROR, colocarAlertas] // Agregar colocarAlertas a dependencias
  );

  // Función para mostrar alertas manualmente
  const showAlert = useCallback((type, title, message, customConfig = {}) => {
    const config = {
      success: {
        icon: "success",
        confirmButtonColor: "#10b981",
      },
      error: {
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
    }[type] || { icon: "info" };

    alert.show({ 
      title, 
      text: message, 
      ...config,
      ...customConfig 
    });
  }, [alert]);

  // Función para mostrar toasts manualmente
  const showToast = useCallback((type, title, message, customConfig = {}) => {
    const config = {
      success: {
        icon: "success",
        confirmButtonColor: "#10b981",
      },
      error: {
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
    }[type] || { icon: "info" };

    alert.toast({ 
      title, 
      message, 
      config: {
        position: "bottom-end",
        timer: 3000,
        ...config,
        ...customConfig 
      }
    });
  }, [alert]);

  // Funciones auxiliares
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

  // Crear instancia de axios con useMemo
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.serverUrl,
      timeout: 30000,
      withCredentials: true,
    });

    // Interceptor de respuesta
    instance.interceptors.response.use(
      (response) => {
        const backendResponse = response.data;

        if (backendResponse && typeof backendResponse === "object") {
          // Caso 1: Respuesta de éxito
          if (backendResponse.success === true) {
            const successResponse = {
              data: backendResponse.data || null,
            };
            return successResponse.data;
          }

          // Caso 2: Respuesta de error
          if (backendResponse.success === false) {
            const errorType = backendResponse.type || RESPONSE_TYPES.ERROR;
            
            const errorResponse = {
              type: errorType,
              status: backendResponse.status || response.status,
              title: backendResponse.title || "Error",
              message: backendResponse.message || "Error en la operación", 
              data: null,
              error: backendResponse.error || null,
              originalResponse: response,
            };

            console.log("Error del backend:", errorResponse);
            
            // Llamar showAutoAlert (respetará colocarAlertas)
            showAutoAlert(errorResponse);

            return Promise.reject(errorResponse);
          }
        }

        // Caso 3: Respuesta sin formato
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
        };

        // Clasificar el tipo de error
        if (error.code === "ECONNABORTED") {
          formattedError.message = "Timeout: La solicitud tardó demasiado";
          formattedError.title = "Timeout";
        } else if (error.response) {
          // El backend respondió con un error HTTP
          const backendError = error.response.data;

          // Si el error viene de tu FormatResponseController
          if (
            backendError &&
            typeof backendError === "object" &&
            backendError.success === false
          ) {
            formattedError.type = backendError.type || RESPONSE_TYPES.ERROR;
            formattedError.status = backendError.status;
            formattedError.title = backendError.title || "Error";
            formattedError.message = backendError.message || "Error en el servidor";
            formattedError.error = backendError.error;
          }
          // Si el error es de validación (tus validationErrors)
          else if (backendError && Array.isArray(backendError)) {
            formattedError.type = RESPONSE_TYPES.VALIDATION_ERROR;
            formattedError.title = "Error de Validación";
            formattedError.message = "Los datos enviados no son válidos";
            formattedError.error = backendError;
          }
          // Error HTTP genérico
          else {
            formattedError.message = getHttpErrorMessage(error.response.status);
            formattedError.title = getHttpErrorTitle(error.response.status);
          }
        } else if (error.request) {
          // Error de red (sin respuesta)
          formattedError.message = "No se pudo conectar con el servidor";
          formattedError.title = "Error de Conexión";
        }
        
        console.log("Error formateado:", formattedError);
        
        // Mostrar alerta de error automáticamente (respetará colocarAlertas)
        showAutoAlert(formattedError);

        return Promise.reject(formattedError);
      }
    );

    // Métodos auxiliares
    instance.responseTypes = RESPONSE_TYPES;

    instance.isSuccess = (response) =>
      response && response.type === RESPONSE_TYPES.SUCCESS;

    instance.isValidationError = (error) =>
      error.type === RESPONSE_TYPES.VALIDATION_ERROR;

    instance.getValidationMessages = (error) => {
      if (error.error && Array.isArray(error.error)) {
        return error.error
          .map((err) => `${err.path}: ${err.message}`)
          .join(", ");
      }
      return error.message;
    };

    // Métodos para mostrar alertas manualmente (siempre disponibles)
    instance.showAlert = showAlert;
    instance.showToast = showToast;

    // Método para verificar si las alertas automáticas están activas
    instance.areAlertsEnabled = () => colocarAlertas;

    return instance;
  }, [alert, showAutoAlert, showAlert, showToast, RESPONSE_TYPES, colocarAlertas]);

  return axiosInstance;
};

export default useApi;