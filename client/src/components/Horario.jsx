import Clase from "./ui/clase";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { useState, useEffect } from "react";

const initialHours = {
  700: true,
  745: true,
  830: true,
  915: true,
  1000: true,
  1045: true,
  1130: true,
  1215: true,
  1300: true,
  1345: true,
  1430: true,
  1515: true,
  1600: true,
  1645: true,
  1730: true,
  1815: true,
  1900: true,
  1945: true,
  2030: true,
};
export default function Horario({ Horario }) {
  const [tableMatriz, setTableMatriz] = useState([
    { dia: "lunes", horas: { ...initialHours } },
    { dia: "martes", horas: { ...initialHours } },
    { dia: "miercoles", horas: { ...initialHours } },
    { dia: "jueves", horas: { ...initialHours } },
    { dia: "viernes", horas: { ...initialHours } },
    { dia: "sabado", horas: { ...initialHours } },
  ]);

  useEffect(() => {
    const obtenerClases = () => {
      setTableMatriz((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          dia: item.dia,
          horas: { ...item.horas },
        }));

        Horario.dias.forEach((dia) => {
          let idDia;
          switch (dia.nombre.toLowerCase()) {
            case "lunes": {
              idDia = 0;
              break;
            }
            case "martes": {
              idDia = 1;
              break;
            }
            case "miercoles": {
              idDia = 2;
              break;
            }
            case "jueves": {
              idDia = 3;
              break;
            }
            case "viernes": {
              idDia = 4;
              break;
            }
            case "sabado": {
              idDia = 5;
              break;
            }
          }

          dia.clases.forEach((clase) => {
            const [horaInicioH, horaInicioM] = clase.horaInicio.split(":");
            const [horaFinH, horaFinM] = clase.horaFin.split(":");

            const inicioMinutos =
              parseInt(horaInicioH) * 60 + parseInt(horaInicioM);
            const finMinutos = parseInt(horaFinH) * 60 + parseInt(horaFinM);
            const duracionMinutos = finMinutos - inicioMinutos;

            const bloques = Math.ceil(duracionMinutos / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicioMinutos + i * 45;
              const horas = Math.floor(minutosActual / 60);
              const minutos = minutosActual % 60;
              const horaHHMM = horas * 100 + minutos;

              if (nuevaMatriz[idDia].horas[horaHHMM] !== undefined) {
                // Guardamos la información completa de la clase y el bloque
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

    obtenerClases();
  }, [Horario]);

  const horasOrdenadas = Object.keys(initialHours)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <TableContainer>
      <Table
        style={{ border: "1px solid black", width: "1200px"}}
      >
        <TableHead>
          <TableRow>
            <TableCell colSpan={7} style={{ textAlign: "center" }}>
              {Horario.pnf} Trayecto {Horario.trayecto} Sección{" "}
              {Horario.seccion}
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

                // Si la celda está ocupada y NO es el primer bloque, OMITIR
                if (celda && celda.ocupado && celda.bloque !== 0) {
                  return null;
                }

                return (
                  <TableCell
                    key={cellKey}
                    rowSpan={celda && celda.ocupado ? celda.bloquesTotales : 1}
                    style={{
                      padding: 0,
                      verticalAlign: "top",
                      height:
                        celda && celda.ocupado
                          ? `${celda.bloquesTotales * 50}px`
                          : "50px",
                    }}
                  >
                    {celda && celda.ocupado ? (
                      <Clase clase={celda.datosClase} />
                    ) : (
                      <div
                        style={{ height: "100%", border: "1px solid #ccc" }}
                      ></div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
