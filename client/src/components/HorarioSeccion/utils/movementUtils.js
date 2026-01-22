import { UTILS } from "../../../utils/utils";

// Función para encontrar slot original
export const findOriginalSlot = (clase, tableHorario) => {
  for (let dia_index = 0; dia_index < tableHorario.length; dia_index++) {
    const dia = tableHorario[dia_index];
    const horas = Object.keys(dia.horas);

    for (const hora of horas) {
      const celda = dia.horas[hora];
      if (celda?.ocupado && celda.datos_clase.id === clase.id) {
        const bloques_necesarios = celda.bloques_totales;
        return {
          dia_index,
          hora_inicio: parseInt(hora),
          bloques_necesarios,
        };
      }
    }
  }
  return null;
};

// Función para liberar slot original
export const liberarSlotOriginal = (originalSlot, tableHorario) => {
  if (!originalSlot) return tableHorario;

  // Calculamos el límite superior una sola vez fuera del loop para ahorrar recursos
  const horaFinLimpieza = parseInt(
    UTILS.sumar45Minutos(
      originalSlot.hora_inicio,
      originalSlot.bloques_necesarios,
    ),
  );

  return tableHorario.map((item, index) => {
    // Si no es el día que queremos limpiar, devolvemos el día intacto
    if (index !== originalSlot.dia_index) return item;

    return {
      ...item,
      horas: Object.keys(item.horas).reduce((acc, hora) => {
        const horaNum = parseInt(hora);
        const valorActual = item.horas[hora];

        // REGLA DE ORO: Si es un string (receso), no lo tocamos NUNCA
        if (typeof valorActual === "string") {
          acc[hora] = valorActual;
          return acc;
        }

        // Si la hora está dentro del rango de la clase que se va, la ponemos en null
        if (horaNum >= originalSlot.hora_inicio && horaNum < horaFinLimpieza) {
          acc[hora] = null;
        } else {
          // Si no, mantenemos lo que había (puede ser otra clase o estar vacío)
          acc[hora] = valorActual;
        }

        return acc;
      }, {}),
    };
  });
};

export const ocuparNuevoSlot = (nuevoSlot, classToMove, tableHorario) => {
  const {
    dia_index,
    hora_inicio,
    hora_fin, // <-- Usaremos esta que viene del slot calculado
    horas_bloques,
    bloques_necesarios,
  } = nuevoSlot;

  // 1. Definimos los datos de la "clase real" UNA SOLA VEZ
  // Esto evita discrepancias entre bloques
  const datosClaseReal = {
    ...classToMove,
    dia_semana: UTILS.obtenerDiaNombre(dia_index),
    hora_inicio: UTILS.formatearHora24(hora_inicio),
    // Usamos la hora_fin que ya calculamos correctamente con el (+1) antes
    hora_fin: UTILS.formatearHora24(Object.keys(UTILS.initialHours)[Object.keys(UTILS.initialHours).map(Number).findIndex(h => h >= hora_fin) + 1]),
    ...(!classToMove.nueva_clase && { clase_move: true }),
  };

  return tableHorario.map((item, index) => {
    if (index !== dia_index) return item;

    return {
      ...item,
      horas: Object.keys(item.horas).reduce((acc, hora) => {
        const horaNum = parseInt(hora);
        const valorOriginal = item.horas[hora];
        const esString = typeof valorOriginal === "string";

        // PRIORIDAD: Si es un receso, no se toca
        if (esString) {
          acc[hora] = valorOriginal;
          return acc;
        }

        const debeOcuparEstaHora = horas_bloques.includes(horaNum);

        if (debeOcuparEstaHora) {
          // Calculamos qué número de bloque es este (0, 1, 2...)
          const bloqueActualIndex = horas_bloques
            .filter((h) => h < horaNum)
            .filter((h) => typeof item.horas[h] !== "string").length;

          acc[hora] = {
            ocupado: true,
            datos_clase: datosClaseReal, // <-- Insertamos la misma data real en todos
            bloque: bloqueActualIndex,
            bloques_totales: bloques_necesarios,
          };
        } else {
          acc[hora] = valorOriginal;
        }

        return acc;
      }, {}),
    };
  });
};
