import fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  ImageRun,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  PageOrientation,
  TextWrappingType,
  WidthType,
  AlignmentType,
  TextRun,
  Header,
} from "docx";
import sharp from "sharp";
import { UTILS } from "../utils/utilis";

// Estilos globales
const ESTILOS = {
  fuente: "Calibri",
  tamanos: {
    titulo: 36,
    subtitulo: 28,
    encabezado: 14,
    contenido: 12,
    hora: 10,
    detalle: 11,
    informacion: 16,
  },
  espaciado: {
    paddingCelda: 60,
    marginInterno: 40,
    alturaFila: 400,
    entreLineas: 250,
    alturaFilaInformacion: 600,
  },
  colores: {
    primario: "2E75B5",
    secundario: "D9E2F3",
    fondoClase: "F8F9FA",
    textoClaro: "FFFFFF",
    textoOscuro: "000000",
    textoGris: "666666",
    borde: "CCCCCC",
    fondoInformacion: "E7EFF9",
  },
  bordes: {
    grosor: 2,
    color: "CCCCCC",
  },
};

class DocumentServices {
  static async traerLogoMarcaAgua() {
    try {
      const logoData = fs.readFileSync("../utils/LogoSimple.png");
      const imagenProcesada = await sharp(logoData)
        .png({ transparency: true })
        .composite([
          {
            input: Buffer.from([255, 255, 255, 128]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: "over",
          },
        ])
        .toBuffer();

      const logoMarcaAgua = new ImageRun({
        data: imagenProcesada,
        transformation: {
          width: 400,
          height: 400,
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: AlignmentType.CENTER,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: AlignmentType.CENTER,
            offset: 1000000,
          },
          wrap: {
            type: TextWrappingType.BEHIND,
          },
          zIndex: -9999,
        },
      });

      return logoMarcaAgua;
    } catch (error) {
      console.error("Error procesando logo:", error);
      return null;
    }
  }

  // Función para crear texto con estilo
  static crearTextoEstilizado(texto, config = {}) {
    const {
      bold = false,
      size = ESTILOS.tamanos.contenido,
      color = ESTILOS.colores.textoOscuro,
    } = config;

    return new TextRun({
      text: texto,
      bold: bold,
      size: size * 2,
      color: color,
      font: ESTILOS.fuente,
    });
  }

  // Función para crear párrafo con estilo
  static crearParrafoEstilizado(children, config = {}) {
    const {
      alignment = AlignmentType.CENTER,
      spacing = {
        line: ESTILOS.espaciado.entreLineas,
        before: ESTILOS.espaciado.marginInterno,
        after: ESTILOS.espaciado.marginInterno,
      },
    } = config;

    return new Paragraph({
      children: Array.isArray(children) ? children : [children],
      alignment: alignment,
      spacing: spacing,
    });
  }

  // Función para crear celda con estilo
  static crearCeldaEstilizada(children, config = {}) {
    const {
      shading = null,
      rowSpan = 1,
      colSpan = 1,
      borders = {
        top: {
          style: "single",
          size: ESTILOS.bordes.grosor,
          color: ESTILOS.bordes.color,
        },
        bottom: {
          style: "single",
          size: ESTILOS.bordes.grosor,
          color: ESTILOS.bordes.color,
        },
        left: {
          style: "single",
          size: ESTILOS.bordes.grosor,
          color: ESTILOS.bordes.color,
        },
        right: {
          style: "single",
          size: ESTILOS.bordes.grosor,
          color: ESTILOS.bordes.color,
        },
      },
      margins = {
        top: ESTILOS.espaciado.paddingCelda,
        bottom: ESTILOS.espaciado.paddingCelda,
        left: ESTILOS.espaciado.paddingCelda,
        right: ESTILOS.espaciado.paddingCelda,
      },
      verticalAlign = "center",
    } = config;

    return new TableCell({
      children: Array.isArray(children) ? children : [children],
      shading: shading,
      rowSpan: rowSpan,
      columnSpan: colSpan,
      borders: borders,
      margins: margins,
      verticalAlign: verticalAlign,
    });
  }

  // Función principal que devuelve el buffer
  static async generarDocumentoHorario(configuracion = {}) {
    console.log("🔧 INICIANDO generarDocumentoHorario");
    console.log(
      "📋 Configuración recibida:",
      JSON.stringify(configuracion, null, 2)
    );

    try {
      const doc = await this.crearDocumentoHorario(configuracion);
      console.log("📦 Generando buffer del documento...");
      const buffer = await Packer.toBuffer(doc);
      console.log("✅ Buffer generado exitosamente");
      return buffer;
    } catch (error) {
      console.error("❌ Error al generar el documento:", error);
      throw error;
    }
  }

  // Función principal para crear documento de horario (devuelve el Document)
  static async crearDocumentoHorario(configuracion = {}) {
    const {
      PNF = "",
      Trayecto = "",
      Seccion = { seccion: "" },
      Horario = [],
      Turno = { horaInicio: "07:00", horaFin: "20:00" },
    } = configuracion;

    // Procesar el horario
    const procesarHorario = () => {
      const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];
      const horasDisponibles = this.generarHorasDisponibles(Turno);

      const matrizHorario = diasSemana.map((dia) => ({
        dia,
        horas: horasDisponibles.reduce((acc, hora) => {
          acc[hora] = null;
          return acc;
        }, {}),
      }));

      // Llenar con las clases del horario
      if (Horario && Horario.length > 0) {
        Horario.forEach((dia) => {
          if (!dia.nombre) return;

          const diaIndex = diasSemana.indexOf(dia.nombre.toLowerCase());
          if (diaIndex === -1) return;

          dia.clases?.forEach((clase) => {
            const [hIni, mIni] = clase.horaInicio.split(":");
            const [hFin, mFin] = clase.horaFin.split(":");
            const inicio = UTILS.horasMinutos(hIni, mIni);
            const fin = UTILS.horasMinutos(hFin, mFin);
            const bloques = Math.ceil((fin - inicio) / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicio + i * 45;
              const h = Math.floor(minutosActual / 60);
              const m = minutosActual % 60;
              const horaHHMM = h * 100 + m;

              if (matrizHorario[diaIndex].horas[horaHHMM] !== undefined) {
                if (i === 0) {
                  matrizHorario[diaIndex].horas[horaHHMM] = {
                    ocupado: true,
                    datosClase: { ...clase, horasClase: bloques },
                    bloque: i,
                    bloquesTotales: bloques,
                  };
                } else {
                  matrizHorario[diaIndex].horas[horaHHMM] = {
                    ocupado: true,
                    esContinuacion: true,
                  };
                }
              }
            }
          });
        });
      }

      return {
        matrizHorario,
        horasDisponibles: horasDisponibles.sort((a, b) => a - b),
      };
    };

    // Crear fila de información (PNF, Trayecto, Sección)
    const crearFilaInformacion = (numColumnas) => {
      const textoInformacion = `PNF EN ${PNF.toUpperCase()} TRAVECTO ${Trayecto} SECCIÓN ${
        Seccion.seccion
      }`;

      return new TableRow({
        children: [
          DocumentServices.crearCeldaEstilizada(
            [
              DocumentServices.crearParrafoEstilizado(
                DocumentServices.crearTextoEstilizado(textoInformacion, {
                  bold: true,
                  size: ESTILOS.tamanos.informacion,
                  color: ESTILOS.colores.textoClaro,
                })
              ),
            ],
            {
              shading: { fill: ESTILOS.colores.primario },
              colSpan: numColumnas,
            }
          ),
        ],
        height: {
          value: ESTILOS.espaciado.alturaFilaInformacion,
          rule: "atLeast",
        },
      });
    };

    // Crear filas de la tabla para el documento Word
    const crearFilasTabla = (matrizHorario, horasDisponibles) => {
      const filas = [];

      // Fila de información (PNF, Trayecto, Sección)
      const totalColumnas = 1 + matrizHorario.length;
      const filaInfo = crearFilaInformacion(totalColumnas);
      filas.push(filaInfo);

      // Fila de encabezado con días
      const filaEncabezado = new TableRow({
        children: [
          DocumentServices.crearCeldaEstilizada(
            DocumentServices.crearParrafoEstilizado(
              DocumentServices.crearTextoEstilizado("Hora/Día", {
                bold: true,
                size: ESTILOS.tamanos.encabezado,
                color: ESTILOS.colores.textoClaro,
              })
            ),
            {
              shading: { fill: ESTILOS.colores.primario },
            }
          ),
          ...matrizHorario.map((dia) =>
            DocumentServices.crearCeldaEstilizada(
              DocumentServices.crearParrafoEstilizado(
                DocumentServices.crearTextoEstilizado(
                  dia.dia.charAt(0).toUpperCase() + dia.dia.slice(1),
                  {
                    bold: true,
                    size: ESTILOS.tamanos.encabezado,
                    color: ESTILOS.colores.textoClaro,
                  }
                )
              ),
              {
                shading: { fill: ESTILOS.colores.primario },
              }
            )
          ),
        ],
      });
      filas.push(filaEncabezado);

      // Filas con horarios y clases
      horasDisponibles.forEach((hora) => {
        const celdas = [
          DocumentServices.crearCeldaEstilizada(
            DocumentServices.crearParrafoEstilizado(
              DocumentServices.crearTextoEstilizado(UTILS.formatearHora(hora), {
                bold: true,
                size: ESTILOS.tamanos.hora,
              })
            ),
            {
              shading: { fill: ESTILOS.colores.secundario },
            }
          ),
        ];

        const celdasPorDia = [];

        matrizHorario.forEach((dia, diaIndex) => {
          const celda = dia.horas[hora];

          if (celda?.esContinuacion) {
            celdasPorDia.push({ tipo: "omitir", dia: dia.dia });
          } else if (celda?.ocupado && celda.bloque === 0) {
            const clase = celda.datosClase;
            const contenido = [
              DocumentServices.crearParrafoEstilizado(
                DocumentServices.crearTextoEstilizado(
                  clase.nombre_unidad_curricular || clase.materia || "Clase",
                  { bold: true, size: ESTILOS.tamanos.contenido }
                )
              ),
              ...(clase.nombreProfesor || clase.profesor
                ? [
                    DocumentServices.crearParrafoEstilizado(
                      DocumentServices.crearTextoEstilizado(
                        `Prof: ${clase.nombreProfesor || clase.profesor}`,
                        { size: ESTILOS.tamanos.detalle }
                      )
                    ),
                  ]
                : []),
              ...(clase.aula
                ? [
                    DocumentServices.crearParrafoEstilizado(
                      DocumentServices.crearTextoEstilizado(`Aula: ${clase.aula}`, {
                        size: ESTILOS.tamanos.detalle,
                      })
                    ),
                  ]
                : []),
              DocumentServices.crearParrafoEstilizado(
                DocumentServices.crearTextoEstilizado(`${clase.horaInicio} - ${clase.horaFin}`, {
                  size: ESTILOS.tamanos.detalle,
                  color: ESTILOS.colores.textoGris,
                })
              ),
            ];

            celdasPorDia.push({
              tipo: "clase",
              dia: dia.dia,
              celda: DocumentServices.crearCeldaEstilizada(contenido, {
                rowSpan: celda.bloquesTotales,
                shading: { fill: ESTILOS.colores.fondoClase },
              }),
            });
          } else {
            celdasPorDia.push({
              tipo: "vacia",
              dia: dia.dia,
              celda: DocumentServices.crearCeldaEstilizada([DocumentServices.crearParrafoEstilizado("")]),
            });
          }
        });

        celdasPorDia.forEach((item) => {
          if (item.tipo !== "omitir") {
            celdas.push(item.celda);
          }
        });

        const celdasEsperadas =
          1 + celdasPorDia.filter((item) => item.tipo !== "omitir").length;

        if (celdas.length === celdasEsperadas) {
          filas.push(
            new TableRow({
              children: celdas,
              height: {
                value: ESTILOS.espaciado.alturaFila,
                rule: "atLeast",
              },
            })
          );
        }
      });

      return filas;
    };

    // Procesar el horario
    const { matrizHorario, horasDisponibles } = procesarHorario();

    // Obtener la marca de agua
    const logoMarcaAgua = await DocumentServices.traerLogoMarcaAgua();

    const header = new Header({
      children: [
        new Paragraph({
          children: logoMarcaAgua ? [logoMarcaAgua] : [],
        }),
      ],
    });

    // Crear el documento Word
    const doc = new Document({
      creator: "Vicerrectorado academico UPTAMCA",
      styles: {
        default: {
          document: {
            run: {
              font: ESTILOS.fuente,
              size: ESTILOS.tamanos.contenido * 2,
            },
            paragraph: {
              spacing: { line: ESTILOS.espaciado.entreLineas },
            },
          },
        },
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            run: {
              font: ESTILOS.fuente,
              size: ESTILOS.tamanos.contenido * 2,
            },
            paragraph: {
              spacing: { line: ESTILOS.espaciado.entreLineas },
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.LANDSCAPE,
              },
              margin: {
                top: 400,
                right: 400,
                bottom: 400,
                left: 400,
              },
            },
          },
          headers: {
            default: header,
          },
          children: [
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              columnWidths: [1200, ...Array(matrizHorario.length).fill(2200)],
              rows: crearFilasTabla(matrizHorario, horasDisponibles),
            }),
          ],
        },
      ],
    });

    return doc;
  }

  // Método auxiliar para generar horas disponibles
  static generarHorasDisponibles(turno) {
    const [horaInicio, minInicio] = turno.horaInicio.split(":");
    const [horaFin, minFin] = turno.horaFin.split(":");

    const MinutosInicio = UTILS.horasMinutos(horaInicio, minInicio);
    const MinutosFin = UTILS.horasMinutos(horaFin, minFin);

    const horaInicioHHMM = UTILS.calcularHorasHHMM(MinutosInicio);
    const horaFinHHMM = UTILS.calcularHorasHHMM(MinutosFin);

    const horas = [];
    let horaActual = horaInicioHHMM;

    while (horaActual <= horaFinHHMM) {
      horas.push(horaActual);
      const horasActual = Math.floor(horaActual / 100);
      const minutosActual = horaActual % 100;
      const minutosTotales = horasActual * 60 + minutosActual + 45;
      horaActual = UTILS.calcularHorasHHMM(minutosTotales);
    }

    return horas;
  }
}

export default DocumentServices;