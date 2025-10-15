// Utilidades de slots
export const findOriginalSlot =
  ((clase) => {
    console.log("Buscando slot original para clase:", clase.id); // ← DEBUG
    for (let diaIndex = 0; diaIndex < tableHorario.length; diaIndex++) {
      const dia = tableHorario[diaIndex];
      const horas = Object.keys(dia.horas);

      for (const hora of horas) {
        const celda = dia.horas[hora];
        if (celda?.ocupado && celda.datosClase.id === clase.id) {
          console.log("Slot encontrado:", {
            diaIndex,
            horaInicio: parseInt(hora),
          }); // ← DEBUG
          const bloquesNecesarios = celda.bloquesTotales;
          return {
            diaIndex,
            horaInicio: parseInt(hora),
            bloquesNecesarios,
          };
        }
      }
    }
    console.log("Slot NO encontrado"); // ← DEBUG
    return null;
  },
  [tableHorario]);
export const verificarSiExisteUnidadCurricular = useCallback(
  (unidades) => {
    if (unidades.length === 0) return unidades;

    const idsUnidadesExistentes = new Set();
    const unidadesExistentes = [];

    // Recorrer el horario para encontrar unidades existentes
    tableHorario.forEach((dia) => {
      Object.values(dia.horas).forEach((horaActual) => {
        if (horaActual?.datosClase?.idUnidadCurricular) {
          const existeUnidad = unidades.find(
            (unidad) =>
              unidad.id_unidad_curricular ===
              horaActual.datosClase.idUnidadCurricular
          );

          if (
            existeUnidad &&
            !idsUnidadesExistentes.has(horaActual.datosClase.idUnidadCurricular)
          ) {
            unidadesExistentes.push({
              ...existeUnidad,
              esVista: true,
            });
            idsUnidadesExistentes.add(horaActual.datosClase.idUnidadCurricular);
          }
        }
      });
    });

    // Actualizar todas las unidades con la propiedad esVista
    return unidades.map((unidad) => {
      const existe = unidadesExistentes.some(
        (u) => u.id_unidad_curricular === unidad.id_unidad_curricular
      );
      if (existe) {
        return { ...unidad, esVista: true };
      } else {
        return { ...unidad, esVista: false };
      }
    });
  },
  [tableHorario]
);
export const actualizarDisponibilidadProfesores = useCallback(
  (claseAgregada) => {
    if (!claseAgregada || !claseAgregada.idProfesor) return;

    setProfesores((prevProfesores) => {
      return prevProfesores.map((profesor) => {
        if (profesor.id_profesor === claseAgregada.idProfesor) {
          // Convertir la nueva clase en un bloque de indisponibilidad
          const nuevaIndisponibilidad = {
            dia_semana: UTILS.obtenerDiaNombre(claseAgregada.diaIndex),
            hora_inicio: claseAgregada.horaInicio,
            hora_fin: UTILS.sumar45MinutosHHMM(
              claseAgregada.horaInicio,
              claseAgregada.horasClase
            ),
          };

          // Filtrar disponibilidades que se superponen con la nueva clase
          const disponibilidadFiltrada = profesor.disponibilidad.filter(
            (disp) => {
              if (disp.dia_semana !== nuevaIndisponibilidad.dia_semana) {
                return true; // Días diferentes, mantener
              }

              // Verificar superposición de horarios
              const [dispHoraIni, dispMinIni] = disp.hora_inicio
                .split(":")
                .map(Number);
              const [dispHoraFin, dispMinFin] = disp.hora_fin
                .split(":")
                .map(Number);
              const [nuevaHoraIni, nuevaMinIni] =
                nuevaIndisponibilidad.hora_inicio.split(":").map(Number);
              const [nuevaHoraFin, nuevaMinFin] = nuevaIndisponibilidad.hora_fin
                .split(":")
                .map(Number);

              const dispInicioMin = dispHoraIni * 60 + dispMinIni;
              const dispFinMin = dispHoraFin * 60 + dispMinFin;
              const nuevaInicioMin = nuevaHoraIni * 60 + nuevaMinIni;
              const nuevaFinMin = nuevaHoraFin * 60 + nuevaMinFin;

              // Si no hay superposición, mantener la disponibilidad
              return (
                nuevaFinMin <= dispInicioMin || nuevaInicioMin >= dispFinMin
              );
            }
          );

          return {
            ...profesor,
            disponibilidad: disponibilidadFiltrada,
          };
        }
        return profesor;
      });
    });
  },
  []
);
