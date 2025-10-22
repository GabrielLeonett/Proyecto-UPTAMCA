// hooks/useApi.js
import { useSweetAlert } from "./useSweetAlert";
import axios from "axios";
import { useMemo, useCallback } from "react";
import env from "../config/env";

export const useApi = (colocarAlertas = false) => {
  const alert = useSweetAlert();

  // Tipos de respuesta esperados según FormatterResponseController
  const RESPONSE_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    VALIDATION_ERROR: "validation_error",
    BINARY: "binary" // 👈 NUEVO tipo para respuestas binarias
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
      }[response.type] || { icon: "info" };

      let title = response.title;
      let message = response.message;

      // Manejar errores de validación del FormatterResponseController
      if (
        response.type === RESPONSE_TYPES.VALIDATION_ERROR &&
        response.error &&
        response.error.details &&
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
          }, index * 300);
        });
        return; // Salir después de mostrar toasts de validación
      }

      // Para otros tipos de error (no validación)
      if (response.type === RESPONSE_TYPES.ERROR) {
        alert.show({
          title: title || "Error",
          text: message || "Ha ocurrido un error",
          ...config,
        });
      }
      // Para éxito
      else if (response.type === RESPONSE_TYPES.SUCCESS) {
        alert.show({
          title: title || "Éxito",
          text: message || "Operación completada",
          ...config.success,
        });
      }
    },
    [alert, colocarAlertas]
  );

  // Funciones auxiliares para mensajes HTTP
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

  // Crear instancia de axios con useMemo - ADAPTADA PARA FormatterResponseController
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.serverUrl,
      timeout: 30000,
      withCredentials: true,
    });

    // Interceptor de respuesta ESPECÍFICO para FormatterResponseController
    instance.interceptors.response.use(
      (response) => {
        const contentType = response.headers['content-type'];
        
        // 👇 DETECTAR SI ES UNA IMAGEN/BINARIO
        const isBinaryResponse = 
          contentType && (
            contentType.includes('image/') ||
            contentType.includes('application/octet-stream') ||
            contentType.includes('application/pdf') ||
            response.config.responseType === 'blob' ||
            response.config.responseType === 'arraybuffer'
          );
          
        console.log("🔍 Tipo de respuesta:", {
          contentType,
          isBinaryResponse,
          configResponseType: response.config.responseType
        });

        // CASO 1: ES UNA RESPUESTA BINARIA (IMAGEN, PDF, etc.)
        if (isBinaryResponse) {
          console.log("🖼️ Respuesta binaria detectada");
          
          // Para respuestas binarias, devolver la respuesta completa
          // El frontend manejará el blob/arraybuffer directamente
          return {
            type: RESPONSE_TYPES.BINARY,
            data: response.data,
            headers: response.headers,
            status: response.status,
            config: response.config,
            _isBinary: true
          };
        }

        const backendResponse = response.data;

        console.log("🔍 Respuesta del backend:", backendResponse);

        // CASO 2: Respuesta exitosa de FormatterResponseController
        if (backendResponse && backendResponse.success === true) {
          console.log("✅ Respuesta exitosa detectada");

          // Mostrar alerta de éxito si está activado
          if (colocarAlertas && backendResponse.message) {
            showAutoAlert({
              type: RESPONSE_TYPES.SUCCESS,
              title: backendResponse.title || "Éxito",
              message: backendResponse.message,
            });
          }

          // Devolver los datos para fácil acceso en el frontend
          return backendResponse.data !== undefined ? backendResponse.data : backendResponse;
        }

        // CASO 3: Respuesta de error de FormatterResponseController
        if (backendResponse && backendResponse.success === false) {
          console.log("❌ Respuesta de error detectada");

          const errorType = 
            backendResponse.error?.code === "VALIDATION_ERROR" 
              ? RESPONSE_TYPES.VALIDATION_ERROR 
              : RESPONSE_TYPES.ERROR;

          const errorResponse = {
            type: errorType,
            status: backendResponse.status,
            title: backendResponse.title,
            message: backendResponse.message,
            data: backendResponse.data,
            error: backendResponse.error,
            originalResponse: response,
            _backendStructure: "FormatterResponseController",
          };

          // Llamar showAutoAlert para mostrar el error
          showAutoAlert(errorResponse);

          return Promise.reject(errorResponse);
        }

        // CASO 4: Respuesta sin formato FormatterResponseController (fallback)
        console.warn("⚠️ Respuesta sin formato FormatterResponseController:", backendResponse);
        
        // Si no tiene el formato esperado pero es una respuesta exitosa HTTP
        if (response.status >= 200 && response.status < 300) {
          return backendResponse;
        }

        // Si es una respuesta HTTP de error sin formato
        const fallbackError = {
          type: RESPONSE_TYPES.ERROR,
          status: response.status,
          title: getHttpErrorTitle(response.status),
          message: getHttpErrorMessage(response.status),
          data: backendResponse,
          _backendStructure: "unknown",
        };

        showAutoAlert(fallbackError);
        return Promise.reject(fallbackError);
      },
      (error) => {
        // Manejar errores de red, timeout, o respuestas HTTP de error
        console.error("💥 Error de axios:", error);

        let formattedError = {
          type: RESPONSE_TYPES.ERROR,
          status: error.response?.status || 500,
          title: "Error",
          message: "Error de conexión",
          data: null,
          error: null,
          originalError: error,
          _backendStructure: "network_error",
        };

        // Clasificar el tipo de error
        if (error.code === "ECONNABORTED") {
          formattedError.message = "Timeout: La solicitud tardó demasiado";
          formattedError.title = "Timeout";
        } else if (error.response) {
          // El backend respondió con un error HTTP
          const backendError = error.response.data;

          // Si el error viene de FormatterResponseController
          if (backendError && backendError.success === false) {
            formattedError.type = 
              backendError.error?.code === "VALIDATION_ERROR" 
                ? RESPONSE_TYPES.VALIDATION_ERROR 
                : RESPONSE_TYPES.ERROR;
            formattedError.status = backendError.status;
            formattedError.title = backendError.title;
            formattedError.message = backendError.message;
            formattedError.error = backendError.error;
            formattedError.data = backendError.data;
            formattedError._backendStructure = "FormatterResponseController";
          }
          // Error HTTP genérico sin formato específico
          else {
            formattedError.message = getHttpErrorMessage(error.response.status);
            formattedError.title = getHttpErrorTitle(error.response.status);
            formattedError.data = backendError;
            formattedError._backendStructure = "http_error";
          }
        } else if (error.request) {
          // Error de red (sin respuesta)
          formattedError.message = "No se pudo conectar con el servidor";
          formattedError.title = "Error de Conexión";
        }

        console.log("Error formateado para frontend:", formattedError);

        // Mostrar alerta de error automáticamente
        showAutoAlert(formattedError);

        return Promise.reject(formattedError);
      }
    );

    // 🔧 MÉTODOS AUXILIARES ESPECÍFICOS PARA FormatterResponseController

    instance.responseTypes = RESPONSE_TYPES;

    // Verificar si una respuesta es exitosa
    instance.isSuccess = (response) => {
      return response && response.success === true;
    };

    // Verificar si una respuesta es de error
    instance.isError = (response) => {
      return response && response.success === false;
    };

    // Verificar si es un error de validación
    instance.isValidationError = (error) => {
      return (
        error.type === RESPONSE_TYPES.VALIDATION_ERROR ||
        error.error?.code === "VALIDATION_ERROR"
      );
    };

    // 👇 NUEVOS MÉTODOS PARA MANEJAR BINARIOS/IMÁGENES

    // Verificar si es respuesta binaria
    instance.isBinary = (response) => {
      return response && (response._isBinary === true || response.type === RESPONSE_TYPES.BINARY);
    };

    // Verificar si es imagen específicamente
    instance.isImage = (response) => {
      if (!instance.isBinary(response)) return false;
      const contentType = response.headers?.['content-type'];
      return contentType && contentType.includes('image/');
    };

    // Método para procesar respuestas de imagen
    instance.handleImageResponse = async (response, filename = 'image') => {
      if (!instance.isBinary(response)) {
        throw new Error('La respuesta no es binaria');
      }

      try {
        // Para imágenes en el navegador, crear URL de objeto
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] 
        });
        const imageUrl = URL.createObjectURL(blob);
        
        return {
          blob,
          imageUrl,
          contentType: response.headers['content-type'],
          size: blob.size,
          filename,
          headers: response.headers
        };
      } catch (error) {
        console.error('Error procesando imagen:', error);
        throw error;
      }
    };

    // Método específico para obtener imágenes (más simple)
    instance.getImageBlob = async (url, options = {}) => {
      const response = await instance.get(url, {
        responseType: 'blob',
        ...options
      });
      
      if (instance.isBinary(response)) {
        return instance.handleImageResponse(response);
      }
      
      throw new Error('La respuesta no es una imagen');
    };

    // Obtener mensajes de validación formateados
    instance.getValidationMessages = (error) => {
      if (
        error.error &&
        error.error.details &&
        error.error.details.validationErrors
      ) {
        return error.error.details.validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");
      }
      return error.message;
    };

    // Extraer datos de respuesta exitosa
    instance.extractData = (response) => {
      // Si es respuesta de FormatterResponseController, extraer data
      if (response && typeof response === 'object' && response.success === true) {
        return response.data;
      }
      // Si ya son los datos directos
      return response;
    };

    // Método para verificar si las alertas automáticas están activas
    instance.areAlertsEnabled = () => colocarAlertas;

    // Método para descargar archivos (especial para documentos Word)
    instance.downloadFile = async (url, filename) => {
      try {
        const response = await instance.get(url, {
          responseType: 'blob'
        });

        // Crear URL temporal para descarga
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        return true;
      } catch (error) {
        console.error('Error descargando archivo:', error);
        throw error;
      }
    };

    // 👇 NUEVO: Método específico para descargar imágenes
    instance.downloadImage = async (url, filename = 'image') => {
      try {
        const imageData = await instance.getImageBlob(url);
        
        const link = document.createElement('a');
        link.href = imageData.imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar después de un tiempo
        setTimeout(() => {
          URL.revokeObjectURL(imageData.imageUrl);
        }, 1000);
        
        return true;
      } catch (error) {
        console.error('Error descargando imagen:', error);
        throw error;
      }
    };

    return instance;
  }, [alert, showAutoAlert, RESPONSE_TYPES, colocarAlertas]);

  return axiosInstance;
};

export default useApi;