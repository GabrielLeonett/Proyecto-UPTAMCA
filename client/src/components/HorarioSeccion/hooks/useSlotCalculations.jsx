import { useCallback } from "react";
import { UTILS } from "../../../utils/utils";

export const useSlotCalculations = () => {
  const procesarDisponibilidadDocente = useCallback(
    (
      disponibilidad,
      bloquesNecesarios,
      tableHorario,
      verificarDisponibilidadProfesor,
      verificarDisponibilidadAula, // ✅ AGREGAR para verificar aula también
      clase
    ) => {
      const slotsDisponibles = [];

      try {
        // 1. VALIDACIONES BÁSICAS
        if (
          !disponibilidad ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin ||
          !disponibilidad.dia_semana
        ) {
          console.warn("Disponibilidad incompleta", disponibilidad);
          return slotsDisponibles;
        }

        if (
          !clase ||
          !clase.id_profesor ||
          !clase.id_unidad_curricular ||
          !clase.id_aula
        ) {
          console.warn("Clase incompleta", clase);
          return slotsDisponibles;
        }

        // 2. CONVERTIR HORAS
        const horaHHMMInicio = UTILS.deshacerHora24(
          disponibilidad.hora_inicio
        );
        const horaHHMMFin = UTILS.deshacerHora24(
          disponibilidad.hora_fin
        );

        if (
          horaHHMMInicio === null ||
          horaHHMMFin === null ||
          horaHHMMInicio >= horaHHMMFin
        ) {
          console.warn("Rango de horas inválido", {
            horaHHMMInicio,
            horaHHMMFin,
          });
          return slotsDisponibles;
        }

        const diaDisponibilidad = UTILS.obtenerDiaId(disponibilidad.dia_semana);
        if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
          console.warn("Día inválido", disponibilidad.dia_semana);
          return slotsDisponibles;
        }

        // 3. VERIFICAR SI LA UNIDAD CURRICULAR YA ESTÁ EN ESE DÍA
        const unidadCurricularYaAsignadaEnDia = () => {
          const horasDia = tableHorario[diaDisponibilidad]?.horas;
          if (!horasDia) return false;

          for (const horaKey in horasDia) {
            const celda = horasDia[horaKey];
            if (
              celda?.datos_clase?.id_unidad_curricular ===
              clase.id_unidad_curricular
            ) {
              // Si es diferente clase (misma unidad curricular)
              if (celda.datos_clase.id !== clase.id) {
                return true;
              }
            }
          }
          return false;
        };

        if (unidadCurricularYaAsignadaEnDia()) {
          console.log("Unidad curricular ya asignada en este día");
          return slotsDisponibles;
        }

        // 4. FILTRAR HORAS DENTRO DEL RANGO (excluyendo "string")
        const horasFiltradas = Object.keys(UTILS.initialHours)
          .map(Number)
          .filter((horaHHMM) => {
            // Solo horas dentro del rango de disponibilidad
            const dentroDelRango =
              horaHHMM >= horaHHMMInicio && horaHHMM < horaHHMMFin;
            return dentroDelRango ;
          })
          .sort((a, b) => a - b);
          if (horasFiltradas.length < bloquesNecesarios) {
            console.log("Horas filtradas:", horasFiltradas.length, bloquesNecesarios);
            console.log("Horas insuficientes en el rango");
            return slotsDisponibles;
        }

        // 5. FUNCIÓN PARA VERIFICAR CONSECUTIVIDAD CONSIDERANDO "IGNORAR"
        const obtenerHorasConsecutivas = (indiceInicio) => {
          const horasConsecutivas = [];
          let indiceActual = horasFiltradas.indexOf(
            horasFiltradas[indiceInicio]
          );

          if (indiceActual === -1) return [];

          // Ir buscando horas consecutivas en UTILS.initialHours
          for (let bloque = 0; bloque < bloquesNecesarios; bloque++) {
            // Encontrar la siguiente hora no-ignorar
            let horaEncontrada = null;

            while (indiceActual < horasFiltradas.length && !horaEncontrada) {
              const horaActual = horasFiltradas[indiceActual];

              // Verificar que esta hora sea consecutiva con la anterior
              if (horasConsecutivas.length > 0) {
                const ultimaHora =
                  horasConsecutivas[horasConsecutivas.length - 1];
                // Buscar la posición en initialHours para verificar consecutividad
                const horasOrdenadas = Object.keys(UTILS.initialHours)
                  .map(Number)
                  .sort((a, b) => a - b);

                const indexUltima = horasOrdenadas.indexOf(ultimaHora);
                const indexActual = horasOrdenadas.indexOf(horaActual);

                // Deben ser consecutivas (sin brechas de otras horas no-ignorar)
                if (indexActual !== indexUltima + 1) {
                  return []; // Hay una brecha, no es consecutivo
                }
              }

              horaEncontrada = horaActual;
              horasConsecutivas.push(horaActual);
              indiceActual++;
            }

            if (!horaEncontrada) {
              return []; // No se encontraron suficientes horas consecutivas
            }
          }

          return horasConsecutivas;
        };

        // 6. VERIFICAR DISPONIBILIDAD EN CADA POSICIÓN POSIBLE
        for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
          const horasConsecutivas = obtenerHorasConsecutivas(i);

          if (horasConsecutivas.length !== bloquesNecesarios) {
            continue; // No son consecutivas
          }

          // 7. VERIFICAR QUE LAS CELDAS ESTÉN DISPONIBLES
          const celdasDisponibles = horasConsecutivas.every((hora) => {
            const celda = tableHorario[diaDisponibilidad]?.horas?.[hora];

            // Celda vacía = disponible
            if (celda === null || celda === undefined) {
              return true;
            }

            // Celda ocupada = verificar conflictos
            if (celda.datos_clase) {
              // Mismo profesor = conflicto
              if (celda.datos_clase.id_profesor === clase.id_profesor) {
                return false;
              }

              // Misma aula = conflicto (a menos que ya esté verificando aula en otro lugar)
              if (celda.datos_clase.id_aula === clase.id_aula) {
                return false;
              }
            }

            return true;
          });

          if (!celdasDisponibles) {
            continue;
          }

          // 8. VERIFICAR DISPONIBILIDAD DEL PROFESOR
          const profesorDisponible = verificarDisponibilidadProfesor(
            clase.id_profesor,
            diaDisponibilidad,
            horasConsecutivas[0], // hora_inicio
            bloquesNecesarios,
            clase
          );

          if (!profesorDisponible) {
            continue;
          }

          // 9. VERIFICAR DISPONIBILIDAD DEL AULA (si se pasa la función)
          let aulaDisponible = true;
          if (verificarDisponibilidadAula) {
            aulaDisponible = verificarDisponibilidadAula(
              clase.id_aula,
              diaDisponibilidad,
              horasConsecutivas[0], // hora_inicio
              bloquesNecesarios,
              clase
            );
          }

          if (!aulaDisponible) {
            continue;
          }

          // 10. CALCULAR HORA FIN CORRECTAMENTE
          const horaInicio = horasConsecutivas[0];
          const horaFinCalculada = UTILS.calcularHoraFinConIgnorar(
            horaInicio,
            bloquesNecesarios
          );

          // 11. CREAR SLOT VÁLIDO
          const slot = {
            dia_index: diaDisponibilidad,
            hora_inicio: horaInicio,
            hora_fin: horaFinCalculada, // ✅ Usar cálculo correcto, no índice del array
            horas_bloques: horasConsecutivas,
            bloques_necesarios: bloquesNecesarios,
          };

          slotsDisponibles.push(slot);
        }
      } catch (error) {
        console.error("Error en procesarDisponibilidadDocente:", error);
      }

      return slotsDisponibles;
    },
    []
  );

  // ✅ AGREGAR FUNCIÓN DE VALIDACIÓN MEJORADA
  const validarDatosClase = useCallback((clase) => {
    if (!clase) {
      console.warn("Clase no definida");
      return false;
    }

    const bloquesNecesarios = parseInt(clase.horas_clase);

    if (bloquesNecesarios <= 0 || bloquesNecesarios > 10) {
      // Límite razonable
      console.warn("Bloques necesarios inválidos:", clase);
      return false;
    }

    return bloquesNecesarios;
  }, []);

  return {
    procesarDisponibilidadDocente,
    validarDatosClase,
  };
};
