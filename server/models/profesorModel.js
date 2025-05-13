import UserModel from "./userModel";
import { db } from "../db.js";

class ProfesorModel extends UserModel {
    static async registerProfesor(datosProfesor) {
        try{
            const query = `
                SELECT REGISTRA_PROFESOR(
                    $1, $2, $3, $4, $5, $6, $7, $8
                ) AS result
            `;
            const values = [
                id,
                nombres,
                apellidos,
                email,
                direccion,
                telefono_movil,
                telefono_local,
                fecha_nacimiento
            ];
            const result = db.query(query, values)
            return result.rows[0].result;
        }catch(error){
            console.error("Error al registrar profesor:", error);
            throw error;
        }
    }
}