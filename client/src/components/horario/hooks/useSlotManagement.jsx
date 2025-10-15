import { useCallback } from "react";

// Gestión de slots y disponibilidad
const useSlotManagement = (state, stateSetters, utils, actions) => {
  const {
    availableSlots,
    selectedClass,
    classToMove,
    newClass
  } = state;

  const {
    setSelectedClass,
    setClassToMove,
    setAvailableSlots,
    setTableHorario
  } = stateSetters;

  const { completarMovimiento } = actions;

  // Mover clase al horario - DEFINIR PRIMERO
  const MoverClassEnHorario = useCallback(
    (slot) => {
      const { diaIndex, horaInicio, bloquesNecesarios } = slot;

      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          ...item,
          horas: { ...item.horas },
        }));

        // Crear la clase con formato correcto
        const nuevaClase = {
          ...classToMove,
          horaInicio: `${Math.floor(horaInicio / 100)}:${String(
            horaInicio % 100
          ).padStart(2, "0")}`,
          horaFin: utils.sumar45Minutos(horaInicio, bloquesNecesarios),
        };

        // Ocupar los bloques necesarios
        for (let i = 0; i < bloquesNecesarios; i++) {
          const minutosExtra = i * 45;
          const minutosTotales =
            Math.floor(horaInicio / 100) * 60 +
            (horaInicio % 100) +
            minutosExtra;

          const nuevasHoras = Math.floor(minutosTotales / 60);
          const nuevosMinutos = minutosTotales % 60;
          const horaHHMM = nuevasHoras * 100 + nuevosMinutos;

          nuevaMatriz[diaIndex].horas[horaHHMM] = {
            ocupado: true,
            datosClase: nuevaClase,
            bloque: i,
            bloquesTotales: bloquesNecesarios,
          };
        }

        return nuevaMatriz;
      });

      // Limpiar selección después de agregar
      setSelectedClass(null);
      setAvailableSlots([]);
    },
    [classToMove, setTableHorario, setSelectedClass, setAvailableSlots, utils]
  );

  // Verificar si un slot está disponible
  const isSlotAvailable = useCallback(
    (diaIndex, hora) => {
      return availableSlots.some(
        (slot) =>
          slot.diaIndex === diaIndex &&
          hora >= slot.horaInicio &&
          hora <
            parseInt(
              utils.sumar45Minutos(slot.horaInicio, slot.bloquesNecesarios)
            )
      );
    },
    [availableSlots, utils]
  );

  // Manejar click en slots disponibles
  const handleSlotClick = useCallback(
    (diaIndex, horaInicio) => {
      if (!selectedClass) return;

      console.log("classToMove:", classToMove);
      console.log("selectedClass:", selectedClass);

      const slot = availableSlots.find(
        (slot) => slot.diaIndex === diaIndex && slot.horaInicio === horaInicio
      );

      if (!slot) return;

      if (classToMove) {
        console.log("Moviendo clase existente");
        if (
          window.confirm(
            `¿Mover ${
              classToMove.nombre_unidad_curricular || classToMove.nombreUnidadCurricular
            } a ${utils.obtenerDiaNombre(diaIndex)} a ${utils.formatearHora(
              horaInicio
            )}?`
          )
        ) {
          completarMovimiento(slot);
        }
      } else {
        console.log("Agregando clase nueva");
        if (
          window.confirm(
            `¿Programar ${
              selectedClass.nombre_unidad_curricular || selectedClass.nombreUnidadCurricular
            } en ${utils.obtenerDiaNombre(diaIndex)} a ${utils.formatearHora(
              horaInicio
            )}?`
          )
        ) {
          MoverClassEnHorario(slot);
        }
      }
    },
    [
      selectedClass,
      availableSlots,
      classToMove,
      completarMovimiento,
      MoverClassEnHorario, // ✅ Ahora está definido antes
      utils
    ]
  );

  // Crear nueva clase en el estado
  const crearClaseEnHorario = useCallback(() => {
    if (!newClass.profesor || !newClass.aula || !newClass.unidad) {
      console.warn("Datos incompletos para crear clase");
      return;
    }

    const nuevaClase = {
      id: Date.now(),
      idProfesor: newClass.profesor.id_profesor,
      idAula: newClass.aula.id_aula,
      idUnidadCurricular: newClass.unidad.id_unidad_curricular,
      nombreProfesor: newClass.profesor.nombres,
      apellidoProfesor: newClass.profesor.apellidos,
      nombreUnidadCurricular: newClass.unidad.nombre_unidad_curricular,
      horasClase: newClass.unidad.horas_clase,
      nuevaClase: true,
    };

    setSelectedClass({ ...nuevaClase });
    setClassToMove({ ...nuevaClase });
  }, [newClass, setSelectedClass, setClassToMove]);

  // Función para limpiar selección
  const limpiarSeleccion = useCallback(() => {
    setSelectedClass(null);
    setClassToMove(null);
    setAvailableSlots([]);
  }, [setSelectedClass, setClassToMove, setAvailableSlots]);

  return {
    isSlotAvailable,
    handleSlotClick,
    crearClaseEnHorario,
    MoverClassEnHorario,
    limpiarSeleccion,
  };
};

export default useSlotManagement;