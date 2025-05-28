import db from "../db";
import crypto from 'crypto';

export default class CurricularModel {
    static async registrarPNF({ datos }) {
        try {
            const { nombre_pnf, descripcion, poblacion } = datos;
            
            const id = crypto.randomUUID();

            // Consulta preparada con parámetros
            const query = 'CALL registrar_pnf(?, ?, ?, ?, NULL)';
            const params = [id, nombre_pnf, descripcion, poblacion];

            // Ejecutar el procedimiento almacenado
            const resultado = await db.raw(query, params);

            // Verificar la respuesta (ajustado para el formato JSON que mencionaste antes)
            if (!resultado.rows || resultado.rows.length === 0) {
                throw new Error('No se recibió respuesta del procedimiento almacenado');
            }

            const respuesta = resultado.rows[0].resultado;
            
            if (respuesta.status !== 'success') {
                throw new Error(respuesta.message || 'Error al registrar el PNF');
            }

            return {
                message: respuesta.message,
                status: respuesta.status
            };
            
        } catch (error) {
            // Mejor manejo de errores
            console.error('Error en PnfModel.registrarPNF:', error);
            throw new Error(error.message || 'Error al registrar el PNF');
        }
    }
}