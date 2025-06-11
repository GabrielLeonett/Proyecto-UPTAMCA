import bcrypt from "bcrypt";
import crypto from 'crypto';

export async function generarPassword() {
    const randomString = crypto.randomBytes(10).toString('hex'); 
    return randomString;
}

//Hasheo de la contraseñas o datos
export async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const passwordHasheada = await bcrypt.hash(password, saltRounds);
    return passwordHasheada;
  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
    throw new Error("Error al procesar la contraseña");
  }
}

export async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error("Error al comparar la contraseña:", error);
    throw new Error("Error al procesar la contraseña");
  }
}
