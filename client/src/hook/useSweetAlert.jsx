// hooks/useSweetAlert.js
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

/**
 * Custom hook para manejar alertas personalizadas usando SweetAlert2
 * @returns {Object} Objeto con métodos para mostrar diferentes tipos de alertas
 */
const useSweetAlert = () => {
  const theme = useTheme();

  /**
   * Obtiene la configuración base para las alertas
   * @returns {Object} Configuración base de SweetAlert2
   * @private
   */
  const getBaseConfig = () => ({
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    confirmButtonColor: theme.palette.primary.main,
    cancelButtonColor: theme.palette.error.main,
    customClass: {
      popup: "sweetalert-custom-popup",
      title: "sweetalert-custom-title",
      confirmButton: "sweetalert-custom-confirm-btn",
      cancelButton: "sweetalert-custom-cancel-btn",
    },
  });

  /**
   * Objeto que contiene todos los métodos para mostrar alertas
   * @type {Object}
   * @property {Function} show - Muestra una alerta personalizada
   * @property {Function} success - Muestra una alerta de éxito
   * @property {Function} error - Muestra una alerta de error
   * @property {Function} warning - Muestra una alerta de advertencia
   * @property {Function} info - Muestra una alerta informativa
   * @property {Function} confirm - Muestra una alerta de confirmación
   * @property {Function} prompt - Muestra una alerta con campo de entrada
   * @property {Function} toast - Muestra un toast notification
   */
  const alert = {
    /**
     * Función para mostrar una alerta personalizada
     * @param {object} config - Configuración de SweetAlert2
     */
    show: (config) => {
      Swal.fire({ ...getBaseConfig(), ...config });
    },

    /**
     * Función para mostrar una alerta de éxito
     * @param {string} title - Título de la alerta
     * @param {string} text - Texto de la alerta
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve cuando la alerta se cierra
     */
    success: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "success",
        confirmButtonColor: theme.palette.success.main,
        ...config,
      }),

    /**
     * Función para mostrar una alerta de error
     * @param {string} title - Título de la alerta
     * @param {string} text - Texto de la alerta
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve cuando la alerta se cierra
     */
    error: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "error",
        ...config,
      }),

    /**
     * Función para mostrar una alerta de advertencia
     * @param {string} title - Título de la alerta
     * @param {string} text - Texto de la alerta
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve cuando la alerta se cierra
     */
    warning: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "warning",
        confirmButtonColor: theme.palette.warning.main,
        ...config,
      }),

    /**
     * Función para mostrar una alerta informativa
     * @param {string} title - Título de la alerta
     * @param {string} text - Texto de la alerta
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve cuando la alerta se cierra
     */
    info: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "info",
        confirmButtonColor: theme.palette.info.main,
        ...config,
      }),

    /**
     * Función para mostrar una alerta de confirmación
     * @param {string} title - Título de la alerta
     * @param {string} text - Texto de la alerta
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve con el resultado de la confirmación
     */
    confirm: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        ...config,
      }),

    /**
     * Función para mostrar una alerta con campo de entrada
     * @param {string} title - Título de la alerta
     * @param {string} inputType - Tipo de campo de entrada (text, email, password, etc.)
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve con el valor ingresado
     */
    prompt: (title, inputType = "text", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        input: inputType,
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        ...config,
      }),

    /**
     * Función para mostrar un toast notification
     * @param {string} title - Título del toast
     * @param {string} message - Mensaje del toast
     * @param {object} config - Configuración adicional de SweetAlert2
     * @returns {Promise} Promesa que se resuelve cuando el toast se cierra
     */
    toast: ({ title, message, config = {} }) => {
      // Crear una instancia única para cada toast
      Swal.fire({
        title,
        text: message,
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
        ...getBaseConfig(),
        ...config,
      });
    },
  };

  return alert;
};

export default useSweetAlert;
