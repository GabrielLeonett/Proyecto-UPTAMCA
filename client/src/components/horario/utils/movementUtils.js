import { UTILS } from "../../../utils/utils";

// Función para encontrar slot original
export const findOriginalSlot = (clase, tableHorario) => {
  console.log("Buscando slot original para clase:", clase.id);
  for (let diaIndex = 0; diaIndex < tableHorario.length; diaIndex++) {
    const dia = tableHorario[diaIndex];
    const horas = Object.keys(dia.horas);

    for (const hora of horas) {
      const celda = dia.horas[hora];
      if (celda?.ocupado && celda.datosClase.id === clase.id) {
        console.log("Slot encontrado:", {
          diaIndex,
          horaInicio: parseInt(hora),
        });
        const bloquesNecesarios = celda.bloquesTotales;
        return {
          diaIndex,
          horaInicio: parseInt(hora),
          bloquesNecesarios,
        };
      }
    }
  }
  console.log("Slot NO encontrado");
  return null;
};

// Función para liberar slot original
export const liberarSlotOriginal = (originalSlot, tableHorario) => {
  if (!originalSlot) return tableHorario;

  return tableHorario.map((item, index) => ({
    ...item,
    horas: { ...item.horas },
    ...(index === originalSlot.diaIndex && {
      horas: Object.keys(item.horas).reduce((acc, hora) => {
        const horaNum = parseInt(hora);
        if (
          horaNum >= originalSlot.horaInicio &&
          horaNum <
            parseInt(
              UTILS.sumar45Minutos(
                originalSlot.horaInicio,
                originalSlot.bloquesNecesarios
              )
            )
        ) {
          acc[hora] = null;
        } else {
          acc[hora] = item.horas[hora];
        }
        return acc;
      }, {}),
    }),
  }));
};

// Función para ocupar nuevo slot
export const ocuparNuevoSlot = (nuevoSlot, classToMove, tableHorario) => {
  const { diaIndex, horaInicio, bloquesNecesarios } = nuevoSlot;

  return tableHorario.map((item, index) => ({
    ...item,
    horas: { ...item.horas },
    ...(index === diaIndex && {
      horas: Object.keys(item.horas).reduce((acc, hora) => {
        const horaNum = parseInt(hora);
        const horaFin = parseInt(
          UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
        );

        if (horaNum >= horaInicio && horaNum < horaFin) {
          const bloqueIndex = Math.floor((horaNum - horaInicio) / 45);
          acc[hora] = {
            ocupado: true,
            datosClase: {
              ...classToMove,
              horaInicio: UTILS.sumar45MinutosHHMM(horaInicio, 0),
              horaFin: UTILS.sumar45MinutosHHMM(
                horaInicio,
                bloquesNecesarios - 1
              ),
            },
            bloque: bloqueIndex,
            bloquesTotales: bloquesNecesarios,
          };
        } else {
          acc[hora] = item.horas[hora];
        }
        return acc;
      }, {}),
    }),
  }));
};
