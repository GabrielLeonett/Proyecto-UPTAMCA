import bcrypt from 'bcrypt';

// Versión corregida y mejorada de hashPassword
export async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const passwordHasheada = await bcrypt.hash(password, saltRounds);
        return passwordHasheada;
    } catch (error) {
        console.error('Error al hashear la contraseña:', error);
        throw new Error('Error al procesar la contraseña');
    }
}

// Versión corregida y mejorada de comparePassword
export async function comparePassword(password, hash) {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return false;
    }
}