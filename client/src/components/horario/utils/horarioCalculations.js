// Funciones de cálculo de horarios
export const calcularHorariosDisponibles = useCallback(
    (clase) => {
      // Validaciones iniciales
      if (!clase || !clase.idProfesor || !clase.horasClase) {
        console.warn("Datos de clase incompletos");
        setAvailableSlots([]);
        return;
      }

      const bloquesNecesarios = parseInt(clase.horasClase);
      if (isNaN(bloquesNecesarios) || bloquesNecesarios <= 0) {
        console.warn("Duración de clase inválida");
        setAvailableSlots([]);
        return;
      }

      const slotsDisponibles = [];
      const disponibilidadDocente = [];

      getDataProfesores(clase.horasClase);

      // Buscar profesor y su disponibilidad
      const profesor = profesores.find(
        (prof) => prof.id_profesor === clase.idProfesor
      );

      if (!profesor) {
        console.warn(`Profesor con ID ${clase.idProfesor} no encontrado`);
        setAvailableSlots([]);
        return;
      }

      if (!profesor.disponibilidad || profesor.disponibilidad.length === 0) {
        console.warn("Profesor no tiene disponibilidad definida");
        setAvailableSlots([]);
        return;
      }

      disponibilidadDocente.push(...profesor.disponibilidad);

      // Procesar cada bloque de disponibilidad
      disponibilidadDocente.forEach((disponibilidad) => {
        if (
          !disponibilidad.dia_semana ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin
        ) {
          console.warn("Disponibilidad con datos incompletos", disponibilidad);
          return;
        }

        try {
          const [horaInicio, minutoInicio] = disponibilidad.hora_inicio
            .split(":")
            .map(Number);
          const [horaFin, minutoFin] = disponibilidad.hora_fin
            .split(":")
            .map(Number);

          if (
            isNaN(horaInicio) ||
            isNaN(minutoInicio) ||
            isNaN(horaFin) ||
            isNaN(minutoFin)
          ) {
            console.warn("Formato de hora inválido", disponibilidad);
            return;
          }

          const diaDisponibilidad = UTILS.obtenerDiaId(
            disponibilidad.dia_semana
          );
          if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
            console.warn("Día de semana inválido", disponibilidad.dia_semana);
            return;
          }

          const horaHHMMInicio = UTILS.calcularHorasHHMM(
            UTILS.horasMinutos(horaInicio, minutoInicio)
          );
          const horaHHMMFin = UTILS.calcularHorasHHMM(
            UTILS.horasMinutos(horaFin, minutoFin)
          );

          if (horaHHMMInicio >= horaHHMMFin) {
            console.warn(
              "Hora de inicio mayor o igual que hora fin",
              disponibilidad
            );
            return;
          }

          // Filtrar horas dentro del rango disponible
          const horasFiltradas = Object.keys(initialHours)
            .map(Number)
            .filter(
              (horaHHMM) =>
                horaHHMM >= horaHHMMInicio && horaHHMM <= horaHHMMFin
            )
            .sort((a, b) => a - b);

          if (horasFiltradas.length < bloquesNecesarios) {
            return; // No hay suficientes horas disponibles
          }

          // Buscar bloques consecutivos
          for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
            // Verificar que las horas están en posiciones consecutivas en el array
            const esConsecutivo = () => {
              for (let j = 0; j < bloquesNecesarios - 1; j++) {
                const indexActual = i + j;
                const indexSiguiente = i + j + 1;

                // Verificar que están en posiciones adyacentes en el array
                // Esto asume que el array está ordenado cronológicamente
                if (indexSiguiente >= horasFiltradas.length) return false;
                if (
                  horasFiltradas[indexSiguiente] <= horasFiltradas[indexActual]
                )
                  return false;
              }
              return true;
            };

            if (!esConsecutivo) continue;

            // Verificar disponibilidad en horario
            const horasBloque = horasFiltradas.slice(i, i + bloquesNecesarios);
            const esDisponible = horasBloque.every(
              (hora) => tableHorario[diaDisponibilidad]?.horas?.[hora] === null
            );

            if (!esDisponible) continue;

            // Verificar disponibilidad del profesor
            const idProfesor = clase.idProfesor;
            console.log("id del profesor: ", idProfesor);
            const profesorDisponible = verificarDisponibilidadProfesor(
              idProfesor,
              diaDisponibilidad,
              horasFiltradas[i],
              bloquesNecesarios
            );
            console.log(
              "Este profesor esta disponible en el horario:",
              profesorDisponible
            );

            if (profesorDisponible) {
              slotsDisponibles.push({
                diaIndex: diaDisponibilidad,
                horaInicio: horasFiltradas[i],
                bloquesNecesarios,
              });
            }
          }
        } catch (error) {
          console.error(
            "Error procesando disponibilidad:",
            error,
            disponibilidad
          );
        }
      });
      console.log("Slots disponibles para colocar la clase:", slotsDisponibles);
      setAvailableSlots(slotsDisponibles);
    },
    [profesores, tableHorario, verificarDisponibilidadProfesor]
  );

export const const verificarDisponibilidadProfesor = useCallback(
    (profesorId, diaIndex, horaInicio, bloquesNecesarios) => {
      const horarioProfesor = profesoresHorarios.find(
        (profesor) => profesor.idProfesor === profesorId
      );

      if (!horarioProfesor || !horarioProfesor.dias) return true;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
      );

      // Verificar si el profesor ya tiene clase en este día y rango de horas
      return !horarioProfesor.dias.some((dias) => {
        if (UTILS.obtenerDiaId(dias.nombre) !== diaIndex) return false;

        dias.clases.forEach((clase) => {
          const [claseHoraIni, claseMinIni] = clase.horaInicio.split(":");
          const [claseHoraFin, claseMinFin] = clase.horaFin.split(":");

          const claseInicioMinutos =
            parseInt(claseHoraIni) * 60 + parseInt(claseMinIni);
          const claseFinMinutos =
            parseInt(claseHoraFin) * 60 + parseInt(claseMinFin);

          const nuevaInicioMinutos =
            Math.floor(horaInicio / 100) * 60 + (horaInicio % 100);
          const nuevaFinMinutos =
            Math.floor(horaFin / 100) * 60 + (horaFin % 100);

          // Verificar superposición de horarios
          return (
            nuevaInicioMinutos < claseFinMinutos &&
            nuevaFinMinutos > claseInicioMinutos
          );
        });
      });
    },
    [profesoresHorarios]
  );
export const obtenerTurno = (Turno) => {
    const [horaInicio, minInicio] = Turno.horaInicio.split(":");
    const [horaFin, minFin] = Turno.horaFin.split(":");

    const MinutosInicio = UTILS.horasMinutos(horaInicio, minInicio);
    const MinutosFin = UTILS.horasMinutos(horaFin, minFin);

    const horaInicioHHMM = UTILS.calcularHorasHHMM(MinutosInicio);
    const horaFinHHMM = UTILS.calcularHorasHHMM(MinutosFin);

    return { horaInicioHHMM, horaFinHHMM };
  };;