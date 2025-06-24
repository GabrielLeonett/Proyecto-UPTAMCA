//Importacion la libreria para la encriptacion de los datos
import { hashPassword, generarPassword } from "../utils/encrypted.js";
//Importacion de la liberia para la funcin de EnviarCorreos
import { enviarEmail } from "../utils/EnviarCorreos.js";
//Importacion de la conexion con la base de datos
import db from "../db.js";
/*
Importacion de la clase para el formateo de los datos que se reviven de la BD y 
procesamiento para devorlver al controlador el resultado.
*/ 
import FormatResponseModel from '../utils/FormatResponseModel.js'

export default class ProfesorModel {
  static async RegisterProfesor({ datos, usuario_accion }) {
    try {
      // Extracción de los datos para el registro del profesor
      const { 
        cedula, nombres, apellidos, email, direccion,
        telefono_movil, telefono_local, fecha_nacimiento, genero,
        ubicacion, fecha_ingreso, dedicacion, categoria,
        area_de_conocimiento, pre_grado, pos_grado
      } = datos;

      // Generar contraseña temporal y su hash
      const password = await generarPassword();
      const passwordHash = await hashPassword(password);

      // Llamada a la función unificada de PostgreSQL
      const query = `CALL public.registrar_profesor_completo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`;
      
      const params = [
        usuario_accion.id, cedula, nombres, apellidos, email,
        direccion, passwordHash, telefono_movil, telefono_local || null, fecha_nacimiento,
        genero, categoria, dedicacion, ubicacion, pre_grado, pos_grado, 
        area_de_conocimiento, fecha_ingreso
      ];

      // Ejecutar la consulta y procesar la respuesta
      const { rows } = await db.raw(query, params);
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'Profesor registrado con exito');

      // Preparar correo
      const Correo = {
        asunto: "Bienvenido/a al Sistema Académico - Credenciales de Acceso",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">¡Bienvenido/a, ${nombres}!</h2>
          <p>Es un placer darle la bienvenida a nuestra plataforma académica como profesor.</p>
          <p>Sus credenciales de acceso son:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <p><strong>Usuario:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> ${password}</p>
          </div>
          <p><strong>Instrucciones importantes:</strong></p>
          <ul>
            <li>Cambie su contraseña después del primer acceso</li>
            <li>Esta contraseña es temporal y de uso personal</li>
            <li>Guarde esta información en un lugar seguro</li>
          </ul>
          <p>Si tiene alguna duda, contacte al departamento de soporte técnico.</p>
        </div>
        `,
      };

      // Intentar enviar el correo
      await enviarEmail({ Destinatario: email, Correo: Correo });
      
      return resultado
    } catch (error) {
      throw FormatResponseModel.respuestaError(error, "Error al registrar profesor");
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

  static async mostrarProfesor() {
    try {
      //Ejecucion de la consulta a la vista de los profesores
      const { rows } = await db.raw(`SELECT * FROM profesores_informacion_completa;`);
      //Procesamientos de la vista y retorna el resultado
      return FormatResponseModel.respuestaPostgres(rows, 'Profesor registrado con exito');
    } catch (error) {
      //Procesamientos de posibles errores
      throw FormatResponseModel.respuestaError(rows, 'Error al obtener los datos del Profesores');
    }
  }

  static async buscarProfesor({ datos }) {
    try {
      //Obtener la variable de busqueda
      const { busqueda } = datos;

      //Verificacion de la variable de busqueda no sea nula
      if (busqueda === undefined || busqueda === null || busqueda === "") {
        throw new Error("La busqueda no puede esta vacia");
      }

      //Ejecucion de la busqueda dentro de la vista de profesores
      const { rows } = await db.raw(
        `SELECT * FROM PROFESORES_INFORMACION_COMPLETA 
        WHERE nombres ILIKE ? OR apellidos ILIKE ? OR id ILIKE ?`, 
        [`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`]
      );
      
      //Procesamiento de los datos
      const resultado = FormatResponseModel.respuestaPostgres(rows, 'Profesor encontrado con exito');

      //Devuelve el resultado del procesamiento de los datos
      return resultado;
    } catch (error) {
      throw error;
    }
  }
}
