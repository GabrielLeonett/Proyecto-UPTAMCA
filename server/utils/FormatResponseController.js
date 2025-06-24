export default class FormatResponseController {
  /**
   * Maneja respuestas exitosas
   * @param {object} res - Objeto response de Express
   */
  static respuestaExito(res, respuestaDatos) {
    try {
      return res.status(respuestaDatos.status).json(respuestaDatos);
    } catch (error) {
      return this.respuestaError(error, res);
    }
  }

  /**
   * Maneja respuestas de error
   * @param {object} res - Objeto response de Express
   */
  static respuestaError(res, respuestaDatos) {
    try {
      return res.status(respuestaDatos.status).json(respuestaDatos);
    } catch (err) {
      console.log(err)
      // Respuesta de fallback para errores inesperados
      return res.status(500).json({
        status: 500,
        state: 'error',
        title: 'Error inesperado',
        message: 'Ocurrió un error al procesar la solicitud',
      });
    }
  }

  /**
   * Maneja respuestas con datos
   * @param {object} res - Objeto response de Express
   * @param {object} respuestaDatos - Objeto que contiene los datos para ser enviasdo 
   */
  static respuestaDatos(res, respuestaDatos) {
    try {
      return res.status(respuestaDatos.status).json(respuestaDatos);
    } catch (error) {
      return this.respuestaError(error, res);
    }
  }

}