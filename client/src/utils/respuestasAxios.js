import Swal from "sweetalert2";

export default function respuestaAxios({ respuesta }) {
  // Extraer datos relevantes de la respuesta
  const status = respuesta?.status || 0;
  const data = respuesta?.data || {};
  const title = data?.title || getDefaultTitle(status);
  const message = data?.message || getDefaultMessage(status);
  const errors = data?.errors;
  
  // Manejar diferentes rangos de códigos de estado
  switch (true) {
    // Respuestas exitosas (200-299)
    case status >= 200 && status < 300:
      Swal.fire({
        title: title,
        text: message,
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      break;

    // Redirecciones (300-399)
    case status >= 300 && status < 400:
      Swal.fire({
        title: title,
        text: message || "La solicitud ha sido redirigida",
        icon: "info",
        confirmButtonText: "Entendido",
      });
      break;

    // Errores del cliente (400-499)
    case status >= 400 && status < 500:
      Swal.fire({
        title: title,
        text: message || "Por favor verifica los datos enviados",
        icon: "error",
        confirmButtonText: "Corregir",
      });
      break;

    // Errores del servidor (500-599)
    case status >= 500:
      Swal.fire({
        title: title,
        text: message || "Ocurrió un problema en el servidor",
        icon: "error",
        confirmButtonText: "Reintentar",
      });
      break;

    // Cualquier otro código
    default:
      Swal.fire({
        title: "Respuesta inesperada",
        text: message || "El servidor respondió de manera inesperada",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
  }

  if (errors) {
    errors.forEach((error, index) => {
      setTimeout(() => {
        Swal.fire({
          toast: true,
          title: title,
          text: error.message,
          icon: "error",
          timer: 3000, // Cierra automáticamente después de 3 segundos
          showConfirmButton: false,
          position: "bottom-end",
        });
      }, index * 3000); // Retraso de 1 segundo entre cada alerta
    });
  }

  // Devolver la respuesta para posible procesamiento adicional
  return respuesta;
}

// Función auxiliar para mensajes por defecto según código de estado
function getDefaultTitle(status) {
  const titles = {
    200: "Operación completada con éxito", // OK
    201: "Recurso creado exitosamente", // Created
    204: "Operación exitosa sin contenido", // No Content
    301: "El recurso ha sido movido permanentemente", // Moved Permanently
    400: "Solicitud incorrecta",
    401: "No autorizado",
    403: "Prohibido",
    404: "Recurso no encontrado",
    500: "Error interno del servidor",
  };
  return titles[status] || "El servidor respondió con un estado inesperado";
}

function getDefaultMessage(status) {
  const messages = {
    200: "Operación completada con éxito",
    201: "Recurso creado exitosamente",
    204: "Operación exitosa sin contenido",
    301: "El recurso ha sido movido permanentemente",
    302: "El recurso ha sido movido temporalmente",
    400: "Solicitud incorrecta",
    401: "No autorizado",
    403: "Acceso prohibido",
    404: "Recurso no encontrado",
    405: "Método no permitido",
    408: "Tiempo de espera agotado",
    409: "Conflicto con el estado actual",
    422: "Entidad no procesable",
    429: "Demasiadas solicitudes",
    500: "Error interno del servidor",
    502: "Bad gateway",
    503: "Servicio no disponible",
    504: "Gateway timeout",
  };

  return messages[status] || "El servidor respondió con un estado inesperado";
}
