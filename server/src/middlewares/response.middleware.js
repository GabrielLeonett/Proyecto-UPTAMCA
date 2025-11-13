// middlewares/responseFormatter.js

/**
 * @middleware responseFormatter
 * @description Formatea todas las respuestas a un formato estándar
 */
export const responseFormatter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Si hay errores de validación, traducir los mensajes
    if (data?.error?.validationErrors) {
      data.error.validationErrors = data.error.validationErrors.map(error => ({
        ...error,
        message: req.t(error.message) // Traducir el mensaje
      }));
    }

    // Formato estándar de respuesta
    const formattedResponse = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      status: res.statusCode,
      title: req.t(data.title || ''),
      message: req.t(data.message || ''),
      data: data.data || null,
      timestamp: new Date().toISOString(),
    };

    // Si hay error, agregarlo al response
    if (data.error) {
      formattedResponse.error = data.error;
    }

    return originalJson.call(this, formattedResponse);
  };

  next();
};