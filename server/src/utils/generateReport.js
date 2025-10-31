import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @async
 * @function generateReport
 * @description Generar un reporte de errores para su verficacion por soporte tecnico.
 * @param {object} errorData - Objeto que sera guardado como error.
 * @author Gabriel Leonett
 */

export default async function generateReport(errorData) {
  const reportPath = path.resolve('./report/report.json');
  
  try {
    // Intentar leer el archivo existente
    let existingData = [];
    try {
      const fileContent = await fs.readFile(reportPath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (readError) {
      if (readError.code !== 'ENOENT') throw readError;
      // Si el archivo no existe, continuamos con array vacío
    }

    // Agregar nuevo error con timestamp
    const newEntry = {
      timestamp: new Date().toISOString(),
      ...errorData
    };
    
    existingData.push(newEntry);

    // Escribir el archivo actualizado
    await fs.writeFile(
      reportPath, 
      JSON.stringify(existingData, null, 2), // Formato legible
      'utf-8'
    );

  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error; // Opcional: relanzar el error
  }
}
