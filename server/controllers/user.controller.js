import UserService from "../services/user.service.js";
import FormatterResponseController from "../utils/FormatterResponseController.js";

export default class UserController {
    static async login(req, res) {
        try {
            const resultado = await UserService.login(req.body);

            // Usar el método principal que maneja automáticamente éxito/error
            if (!resultado.success) {
                return FormatterResponseController.respuestaServicio(res, resultado);
            }

            // Configurar cookie y enviar respuesta exitosa
            res.cookie("autorization", resultado.data.token, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });

            // Usar respuestaServicio para mantener consistencia
            return FormatterResponseController.respuestaServicio(res, resultado);

        } catch (error) {
            console.error("Error en login controller:", error);
            return FormatterResponseController.respuestaError(res, {
                status: 500,
                title: "Error del Controlador",
                message: "Error inesperado en el login",
                error: error.message
            });
        }
    }

    static async verificarUsers(req, res) {
        try {
            const resultado = await UserService.verificarSesion(req.user);
            
            // Usar respuestaServicio para manejar automáticamente éxito/error
            return FormatterResponseController.respuestaServicio(res, resultado);

        } catch (error) {
            console.error("Error en verificarUsers:", error);
            return FormatterResponseController.respuestaError(res, {
                status: 500,
                title: "Error del Controlador",
                message: "Error al verificar la sesión",
                error: error.message
            });
        }
    }

    static async closeSession(req, res) {
        try {
            const resultado = await UserService.cerrarSesion();

            // Limpiar cookie primero
            res.clearCookie("autorization", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
            });

        } catch (error) {
            console.error("Error en closeSession:", error);
            return FormatterResponseController.respuestaError(res, {
                status: 500,
                title: "Error del Controlador",
                message: "Error al cerrar sesión",
                error: error.message
            });
        }
    }

    static async cambiarContraseña(req, res) {
        try {
            const resultado = await UserService.cambiarContraseña(req.body, req.user);
            
            // Usar respuestaServicio para manejo automático
            return FormatterResponseController.respuestaServicio(res, resultado);

        } catch (error) {
            console.error("Error en cambiarContraseña:", error);
            return FormatterResponseController.respuestaError(res, {
                status: 500,
                title: "Error del Controlador",
                message: "Error al cambiar la contraseña",
                error: error.message
            });
        }
    }

    // Método adicional para obtener perfil
    static async obtenerPerfil(req, res) {
        try {
            const { userId } = req.user;
            const resultado = await UserService.obtenerPerfil(userId);
            
            return FormatterResponseController.respuestaServicio(res, resultado);

        } catch (error) {
            console.error("Error en obtenerPerfil:", error);
            return FormatterResponseController.respuestaError(res, {
                status: 500,
                title: "Error del Controlador",
                message: "Error al obtener el perfil",
                error: error.message
            });
        }
    }
}