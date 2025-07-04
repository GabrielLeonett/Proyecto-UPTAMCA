import { hashPassword, generarPassword } from "../utils/encrypted.js";
import { enviarEmail } from "../utils/EnviarCorreos.js";
import db from "../db.js";

export default class ProfesorModel {
  static async RegisterProfesor({ datos }) {
    try {
      const {
        cedula,
        nombres,
        apellidos,
        email,
        direccion,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
        ubicacion,
        fecha_ingreso,
        dedicacion,
        categoria,
        area_de_conocimiento,
        pre_grado,
        pos_grado,
      } = datos;

      const password = '12345678';
      
       const Correo = {
        asunto: "Bienvenido/a al Sistema Académico - Credenciales de Acceso",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #2c3e50;">¡Bienvenido/a, Profesor/a!</h2>
              
              <p>Es un placer darle la bienvenida a nuestra plataforma académica.</p>
              
              <p>Como parte del proceso de incorporación, hemos generado sus credenciales de acceso:</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
                <p><strong>Correo de acceso:</strong> ${email}</p>
                <p><strong>Contraseña temporal:</strong> ${password}</p>
              </div>
              
              <p>Esta información ha sido enviada exclusivamente a su dirección de correo electrónico registrada. 
              Por seguridad, le recomendamos:</p>
              
              <ul>
                <li>Cambiar su contraseña después del primer inicio de sesión</li>
                <li>No compartir estas credenciales con terceros</li>
                <li>Guardar esta información de manera segura</li>
              </ul>
              
              <p>Si no reconoce esta actividad o necesita asistencia, por favor contacte a nuestro 
              <strong>departamento de soporte técnico</strong>.</p>
            </div>
          `,
      };

      await enviarEmail({ Destinatario: email, Correo: Correo });

      const passwordHash = await hashPassword(password);

      const queryUsuario = `CALL registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`;
      const paramsUsuario = [
        cedula,
        nombres,
        apellidos,
        email,
        direccion,
        passwordHash,
        telefono_movil,
        telefono_local || null,
        fecha_nacimiento,
        genero,
      ];

      const queryProfesor = `CALL registrar_profesor(?, ?, ?, ?, ?, ?, ?, ?, NULL);`;
      const paramsProfesor = [
        cedula,
        categoria,
        dedicacion,
        ubicacion,
        pre_grado,
        pos_grado,
        area_de_conocimiento,
        fecha_ingreso,
      ];

      // Usar async/await directamente en lugar de .catch()
      const respuestaTransaccion = await db.transaction(async (trx) => {
        // Crear usuario
        const respuestaUsuario = await trx.raw(queryUsuario, paramsUsuario);
        if (!respuestaUsuario.rows?.[0]?.p_resultado) {
          throw new Error("Error en `registrar_usuario`: Respuesta inválida.");
        }

        const resultadoUsuario = respuestaUsuario.rows[0].p_resultado;
        if (resultadoUsuario.status !== "success") {
          throw new Error(resultadoUsuario.message);
        }

        // Crear profesor
        const respuestaProfesor = await trx.raw(queryProfesor, paramsProfesor);
        if (!respuestaProfesor.rows?.[0]?.p_resultado) {
          throw new Error("Error en `registrar_profesor`: Respuesta inválida.");
        }

        const resultadoProfesor = respuestaProfesor.rows[0].p_resultado;
        if (resultadoProfesor.status !== "success") {
          throw new Error(resultadoProfesor.message);
        }

        return { success: true, message: "Profesor registrado correctamente" };
      }); 

     
      return respuestaTransaccion;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error inesperado al registrar profesor",
      };
    }
  }

  static async mostrarProfesorAPI({ datos }) {
    try {
      const { dedicacion, categoria, ubicacion, area, fecha, genero } = datos;

      const result = await db.raw(
        `SELECT * FROM mostrar_profesor(?, ?, ?, ?, ?, ?) `,
        [
          dedicacion || null,
          categoria || null,
          ubicacion || null,
          area || null,
          fecha || null,
          genero || null,
        ]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async mostrarProfesor({ datos }) {
    try {
      const result = await db.raw(`SELECT * FROM vista_profesor_completo;`);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async buscarProfesor({ datos }) {
    try {
      const { busqueda } = datos;
      if (busqueda === undefined || busqueda === null || busqueda === "") {
        throw new Error("La busqueda no puede esta vacia");
      }

      const result = await db.raw(`SELECT * FROM buscar_profesor(?); `, [
        busqueda,
      ]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  static async actualizarProfesor({ datos }) {}
}
