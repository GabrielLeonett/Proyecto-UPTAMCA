import Clase from "./ui/clase";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import CustomLabel from "./customLabel";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Typography } from "@mui/material";

function obtenerDiaId(dia) {
  switch (dia.toLowerCase()) {
    case "lunes": return 0;
    case "martes": return 1;
    case "miercoles": return 2;
    case "jueves": return 3;
    case "viernes": return 4;
    case "sabado": return 5;
    default: return -1;
  }
}

function obtenerDiaNombre(id) {
  switch (id) {
    case 0: return "lunes";
    case 1: return "martes";
    case 2: return "miercoles";
    case 3: return "jueves";
    case 4: return "viernes";
    case 5: return "sabado";
    default: return "";
  }
}

function sumar45Minutos(horaMilitar, multiplicar) {
  const tiempo = parseInt(horaMilitar);
  const horas = Math.floor(tiempo / 100);
  const minutos = tiempo % 100;
  const totalMinutos = horas * 60 + minutos;
  const nuevoTotalMinutos = totalMinutos + 45 * multiplicar;
  let nuevasHoras = Math.floor(nuevoTotalMinutos / 60);
  const nuevosMinutos = nuevoTotalMinutos % 60;

  if (nuevasHoras >= 24) nuevasHoras = nuevasHoras - 24;
  
  const resultado = nuevasHoras * 100 + nuevosMinutos;
  return resultado.toString().padStart(4, "0");
}

const initialHours = {
  700: null, 745: null, 830: null, 915: null, 1000: null,
  1045: null, 1130: null, 1215: null, 1300: null, 1345: null,
  1430: null, 1515: null, 1600: null, 1645: null, 1730: null,
  1815: null, 1900: null, 1945: null, 2030: null,
};

const horasMinutos = (horas, minutos) => {
  return parseInt(horas) * 60 + parseInt(minutos);
};

// Función para convertir hora en formato HH:MM a formato militar (HHMM)
function horaToMilitar(hora) {
  const [h, m] = hora.split(':');
  return parseInt(h) * 100 + parseInt(m);
}

export default function Horario({ PNF, Trayecto, Seccion, Horario, Custom }) {
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [newClass, setNewClass] = useState({ profesor: null, unidad: null });
  const [profesores, setProfesores] = useState([]);

  const [tableMatriz, setTableMatriz] = useState([
    { dia: "lunes", horas: { ...initialHours } },
    { dia: "martes", horas: { ...initialHours } },
    { dia: "miercoles", horas: { ...initialHours } },
    { dia: "jueves", horas: { ...initialHours } },
    { dia: "viernes", horas: { ...initialHours } },
    { dia: "sabado", horas: { ...initialHours } },
  ]);

  useEffect(() => {
    const obtenerClases = (Dias) => {
      setTableMatriz((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          dia: item.dia,
          horas: { ...initialHours },
        }));

        Dias.forEach((dia) => {
          let idDia = obtenerDiaId(dia.nombre.toLowerCase());

          if (idDia === -1) return;

          dia.clases.forEach((clase) => {
            const [horaInicioH, horaInicioM] = clase.horaInicio.split(":");
            const [horaFinH, horaFinM] = clase.horaFin.split(":");

            const inicioMinutos = horasMinutos(horaInicioH, horaInicioM);
            const finMinutos = horasMinutos(horaFinH, horaFinM);
            const duracionMinutos = finMinutos - inicioMinutos;

            const bloques = Math.ceil(duracionMinutos / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicioMinutos + i * 45;
              const horas = Math.floor(minutosActual / 60);
              const minutos = minutosActual % 60;
              const horaHHMM = horas * 100 + minutos;

              console.log(nuevaMatriz[idDia].horas[horaHHMM], idDia, horaHHMM);

              if (nuevaMatriz[idDia].horas[horaHHMM] !== undefined) {
                nuevaMatriz[idDia].horas[horaHHMM] = {
                  ocupado: true,
                  datosClase: clase,
                  bloque: i,
                  bloquesTotales: bloques,
                };
              }
            }
          });
        });
        return nuevaMatriz;
      });
    };

    obtenerClases(Horario);
  }, [Horario]);

  useEffect(() => {
    const validarNuevaClase = () => {
      if (!newClass.profesor || !newClass.unidad) return false;
      
      const disponibilidadMinutos = horasMinutos(
        newClass.profesor.horas_disponibles.hours,
        newClass.profesor.horas_disponibles.minutes
      );
      const cargaHorasMinutos = newClass.unidad.horas_clase * 45;
      
      return disponibilidadMinutos >= cargaHorasMinutos;
    };

    const anadirAHorario = () => {
      if (!validarNuevaClase()) {
        console.log("No hay suficiente disponibilidad horaria");
        return;
      }

      const bloquesNecesarios = newClass.unidad.horas_clase;
      let slotEncontrado = null;

      // Procesar la disponibilidad del profesor
      if (newClass.profesor.disponibilidad) {
        // Si es un array de disponibilidades
        const disponibilidades = Array.isArray(newClass.profesor.disponibilidad) 
          ? newClass.profesor.disponibilidad 
          : [newClass.profesor.disponibilidad];
        
        // Buscar en cada día de disponibilidad
        for (const disp of disponibilidades) {
          const diaId = obtenerDiaId(disp.dia_semana);
          if (diaId === -1) continue;
          
          // Obtener las horas disponibles para este día
          const horasDisponibles = Object.keys(tableMatriz[diaId].horas).map(Number).sort((a, b) => a - b);
          
          // Buscar un bloque consecutivo disponible
          for (let i = 0; i <= horasDisponibles.length - bloquesNecesarios; i++) {
            let disponible = true;
            
            // Verificar si todos los bloques necesarios están disponibles
            for (let j = 0; j < bloquesNecesarios; j++) {
              const horaActual = horasDisponibles[i + j];
              if (tableMatriz[diaId].horas[horaActual] !== null) {
                disponible = false;
                break;
              }
            }
            
            if (disponible) {
              slotEncontrado = {
                diaIndex: diaId,
                horaInicio: horasDisponibles[i],
                bloquesNecesarios,
              };
              console.log(disp)
              break;
            }
          }
          
          if (slotEncontrado) break;
        }
      }

      if (!slotEncontrado) {
        console.log("No se encontró un horario disponible");
        return;
      }

      // Agregar la nueva clase al horario
      setTableMatriz((prev) => {
        const nuevaMatriz = [...prev];
        const { diaIndex, horaInicio, bloquesNecesarios } = slotEncontrado;

        // Crear el objeto de la nueva clase
        const horaFin = sumar45Minutos(horaInicio, bloquesNecesarios);
        const horaInicioStr = `${Math.floor(horaInicio / 100)}:${String(horaInicio % 100).padStart(2, "0")}`;
        const horaFinStr = `${Math.floor(horaFin / 100)}:${String(horaFin % 100).padStart(2, "0")}`;

        const nuevaClase = {
          id: Date.now(),
          nombreUnidadCurricular: newClass.unidad.nombre_unidad_curricular,
          nombreProfesor: newClass.profesor.nombres,
          apellidoProfesor: newClass.profesor.apellidos,
          horaInicio: horaInicioStr,
          horaFin: horaFinStr,
        };

        // Marcar los bloques de tiempo como ocupados
        for (let i = 0; i < bloquesNecesarios; i++) {
          const horaHHMM = sumar45Minutos(horaInicio, i);
          
          nuevaMatriz[diaIndex].horas[horaHHMM] = {
            ocupado: true,
            datosClase: nuevaClase,
            bloque: i,
            bloquesTotales: bloquesNecesarios,
          };
        }

        return nuevaMatriz;
      });
    };

    if (newClass.profesor && newClass.unidad) {
      anadirAHorario();
    }
  }, [newClass]);


  useEffect(() => {
    const getUnidadesCurriculares = async () => {
      try {
        const data = await axios.get(
          `/Trayecto/Unidades-Curriculares?Trayecto=${Trayecto}`
        );
        setUnidadesCurriculares(data.data.data);
      } catch (error) {
        console.error("Error fetching unidades curriculares:", error);
      }
    };

    const getProfesores = async () => {
      try {
        const data = await axios.get(`/Horarios/Profesores`);
        setProfesores(data.data.data);
      } catch (error) {
        console.error("Error fetching profesores:", error);
      }
    };

    getProfesores();
    getUnidadesCurriculares();
  }, [Trayecto]);

  const handleProfesorChange = (profesorId) => {
    const profesor = profesores.find((p) => p.id_profesor === profesorId);
    setNewClass((prev) => ({ ...prev, profesor }));
  };

  const handleUnidadChange = (unidadId) => {
    const unidad = unidadesCurriculares.find(
      (u) => u.id_unidad_curricular === unidadId
    );
    setNewClass((prev) => ({ ...prev, unidad }));
  };

  const horasOrdenadas = Object.keys(initialHours)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      {Custom ? (
        <form>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              margin: "10px",
              gap: "50px",
            }}
          >
            <CustomLabel
              select
              label="Profesor"
              name="profesor"
              helperText="Seleccione un profesor."
              value={newClass.profesor?.id_profesor || ""}
              onChange={(e) => handleProfesorChange(e.target.value)}
            >
              {profesores && profesores.length > 0 ? (
                profesores.map((profesor) => (
                  <MenuItem
                    key={profesor.id_profesor}
                    value={profesor.id_profesor}
                  >
                    <Typography variant={"body2"}>
                      {profesor.nombres} {profesor.apellidos}
                    </Typography>
                    <Typography variant={"caption"}>
                      {profesor.areas_de_conocimiento}
                    </Typography>
                    <Typography variant={"caption"}>
                      {profesor.horas_disponibles?.hours} Horas{" "}
                      {profesor.horas_disponibles?.minutes} Minutos
                    </Typography>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Cargando profesores...</MenuItem>
              )}
            </CustomLabel>
            <CustomLabel
              select
              label="Unidad Curricular"
              name="unidadCurricular"
              helperText="Seleccione la unidad curricular"
              value={newClass.unidad?.id_unidad_curricular || ""}
              onChange={(e) => handleUnidadChange(e.target.value)}
            >
              {unidadesCurriculares && unidadesCurriculares.length > 0 ? (
                unidadesCurriculares.map((unidad) => (
                  <MenuItem
                    key={unidad.id_unidad_curricular}
                    value={unidad.id_unidad_curricular}
                  >
                    {unidad.nombre_unidad_curricular} ({unidad.horas_clase} horas)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Cargando unidades...</MenuItem>
              )}
            </CustomLabel>
          </Box>
        </form>
      ) : null}
      <TableContainer>
        <Table
          style={{
            border: "1px solid black",
            width: "1000px",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: "center" }}>
                {PNF} Trayecto {Trayecto} Sección {Seccion}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                style={{
                  backgroundColor: "#c4c4c4ff",
                  border: "1px solid black",
                }}
              >
                Hora
              </TableCell>
              {tableMatriz.map((columna) => (
                <TableCell
                  key={columna.dia}
                  style={{ textAlign: "center", border: "1px solid black" }}
                >
                  {columna.dia.charAt(0).toUpperCase() + columna.dia.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {horasOrdenadas.map((hora) => (
              <TableRow key={hora}>
                <TableCell
                  style={{
                    backgroundColor: "#c4c4c4ff",
                    border: "1px solid black",
                  }}
                >
                  {Math.floor(hora / 100) > 12
                    ? Math.floor(hora / 100 - 12)
                    : Math.floor(hora / 100)}
                  :{String(hora % 100).padStart(2, "0")}
                  {Math.floor(hora / 100) > 12 ? " PM" : " AM"}
                </TableCell>
                {tableMatriz.map((columna) => {
                  const celda = columna.horas[hora];
                  const cellKey = `${columna.dia}-${hora}`;

                  if (celda && celda.ocupado && celda.bloque !== 0) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={cellKey}
                      rowSpan={
                        celda && celda.ocupado ? celda.bloquesTotales : 1
                      }
                      style={{
                        padding: 0,
                        verticalAlign: "top",
                        height:
                          celda && celda.ocupado
                            ? `${celda.bloquesTotales * 50}px`
                            : "50px",
                        border: "1px solid black",
                      }}
                    >
                      {celda && celda.ocupado ? (
                        <Clase clase={celda.datosClase} />
                      ) : (
                        <div style={{ height: "100%" }}></div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}