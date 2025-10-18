// hooks/useSweetAlert.js
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

export const useSweetAlert = () => {
  const theme = useTheme();

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

  const alert = {
    show: (config) => Swal.fire({ ...getBaseConfig(), ...config }),

    success: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "success",
        confirmButtonColor: theme.palette.success.main,
        ...config,
      }),

    error: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "error",
        ...config,
      }),

    warning: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "warning",
        confirmButtonColor: theme.palette.warning.main,
        ...config,
      }),

    info: (title, text = "", config = {}) =>
      Swal.fire({
        ...getBaseConfig(),
        title,
        text,
        icon: "info",
        confirmButtonColor: theme.palette.info.main,
        ...config,
      }),

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

    toast: ({ title, message, config = {} }) => {
      // Crear una instancia única para cada toast
      const Toast = Swal.mixin({
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

      return Toast.fire({
        title: title,
        text: message,
      });
    },
  };

  return alert;
};
