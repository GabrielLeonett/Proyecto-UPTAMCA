import { hashPassword } from "../utils/encrypted.js";
import db from "../db.js";

export default class ProfesorModel {
  static async RegisterProfesor({ datos }) {
    try {
      const {
        id,
        nombres,
        apellidos,
        email,
        direccion,
        password,
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

      const passwordHash = await hashPassword(password);

      const queryUsuario = `CALL registrar_usuario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`;
      const paramsUsuario = [
        id,
        nombres,
        apellidos,
        email,
        direccion,
        passwordHash,
        telefono_movil,
        telefono_local,
        fecha_nacimiento,
        genero,
      ];

      const queryProfesor = `CALL registrar_profesor(?, ?, ?, ?, ?, ?, ?, ?, NULL);`;
      const paramsProfesor = [
        id,
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

  static async mostrarProfesor({ datos }) {
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
          genero || null
        ]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async buscarProfesor({datos}){
    try {
      const { busqueda } = datos;
      if(busqueda === undefined || busqueda === null || busqueda === ''){
        throw new Error('La busqueda no puede esta vacia');
      }

      const result = await db.raw(`SELECT * FROM buscar_profesor(?); `,[busqueda]);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
  static async actualizarProfesor({datos}){
    
  }
}
