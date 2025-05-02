import { db } from "../db.js"

export default class authModel {
    static async registerUser({ id, nombres, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero }) {
        try {
            const query = `
                SELECT REGISTER_USER($1, $2, $3, $4, $5, $6, $7, $8, $9) AS result
            `;

            const values = [id, nombres, email, password, direccion, telefono_movil, telefono_local, fecha_nacimiento, genero];

            const result = await db.query(query, values);

            console.log('Result:', result);
            
            if (!result.success) {
                throw new Error(result.message);
            }
            
            return {
                success: true,
                userId: id,
                message: result.message
            };

        } catch (error) {
            console.error('Error Registrar usuario:', error);
            throw new Error(error.message || 'Error al registrar usuario');
        }
    }
}