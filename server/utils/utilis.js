export function asegurarStringEnMinusculas(variable) {
  if (typeof variable === "string") {
    return variable.toLowerCase();
  }
}
export const parseJSONField = (field, fieldName) => {
  if (!field) return [];

  try {
    // Si ya es un array, retornarlo directamente
    if (Array.isArray(field)) {
      return field;
    }

    // Si es string, parsearlo
    if (typeof field === "string") {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    // Si es otro tipo, convertirlo a array
    return [field];
  } catch (error) {
    console.error(`❌ Error parseando ${fieldName}:`, error);
    throw new Error(`Formato inválido en ${fieldName}`);
  }
};
