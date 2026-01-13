/**
 * Middleware para unir automáticamente a un socket a salas de roles basadas en los roles del usuario
 *
 * @function joinRoleRooms
 * @param {Socket} socket - Instancia del socket de Socket.IO
 * @param {Function} next - Función callback para continuar con el siguiente middleware
 *
 * @example
 * // Uso en Socket.IO
 * io.use(joinRoleRooms);
 *
 * @description
 * Este middleware se ejecuta automáticamente cuando un cliente se conecta y lo une a las salas
 * correspondientes a sus roles. Por ejemplo, un usuario con rol "Admin" será unido a la sala "role_admin"
 *
 * @returns {void}
 *
 * @throws {Error} Si ocurre un error durante el proceso de unión a salas
 */
export const joinRoleRooms = (socket, next) => {
  try {
    // Verificar que el usuario tenga roles
    // Prioridad: socket.user.roles (si existe) -> socket.handshake.auth.roles
    const roles = socket.user?.roles || socket.handshake.auth?.roles;

    if (roles && Array.isArray(roles)) {
      // Unir el socket a cada sala de rol correspondiente
      roles.forEach((role) => {
        const roomName = `role_${role.toLowerCase()}`;
        socket.join(roomName);
        //console.log(`✅ ${socket.id} unido a sala: ${roomName}`);
      });

      //console.log(`🎯 Usuario unido a ${roles.length} salas de rol`);
    } else {
      //console.log('⚠️ Usuario sin roles definidos');
    }

    // Continuar con el siguiente middleware o handler de conexión
    next();
  } catch (error) {
    //console.error('❌ Error en joinRoleRooms middleware:', error);
    next(error);
  }
};

/**
 * Middleware para manejar errores de sintaxis JSON en las peticiones HTTP
 *
 * @function jsonSyntaxErrorHandler
 * @param {Error} err - Objeto de error capturado por Express
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express para continuar con el siguiente middleware
 *
 * @returns {Object|void} Respuesta JSON con error 400 si hay problema de sintaxis,
 *                        o llama a next() para continuar el flujo normal
 *
 * @example
 * // Uso en Express
 * app.use(express.json());
 * app.use(jsonSyntaxErrorHandler);
 *
 * @description
 * Este middleware captura específicamente errores de sintaxis JSON (SyntaxError)
 * que ocurren cuando el cuerpo de una petición contiene JSON malformado.
 *
 * Casos comunes que maneja:
 * - Comas faltantes o extras en objetos/arrays
 * - Comillas simples en lugar de dobles
 * - Propiedades sin comillas
 * - JSON incompleto o truncado
 * - Caracteres especiales mal escapados
 *
 * Cuando detecta un error de sintaxis JSON, responde con estado 400 y un mensaje
 * estandarizado, evitando que la aplicación crashee y proporcionando feedback útil al cliente.
 *
 * @throws No lanza excepciones, pero responde con error 400 cuando corresponde
 */
export const jsonSyntaxErrorHandler = (err, req, res, next) => {
  console.log(err.message);
  // Verificar si el error es un SyntaxError relacionado con el parsing del body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Log del error para debugging (opcional)
    console.error("❌ Error de sintaxis JSON:", {
      message: err.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    // Responder con error 400 y mensaje estandarizado
    return res.status(400).json({
      success: false,
      status: 400,
      title: "Error en el formato del JSON",
      message: "Formato de de JSON invalido.",
      data: null,
      error: null,
    });
  }

  // Si no es un error de sintaxis JSON, pasar al siguiente middleware
  next();
};
