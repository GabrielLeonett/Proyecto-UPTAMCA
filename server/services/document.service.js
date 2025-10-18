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
import { UTILS } from "../utils/utilis.js";
import path from "path";

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
      // Solución más simple: usar el directorio de trabajo actual
      const logoPath = path.resolve(process.cwd(), "utils/LogoSimple.png");

      console.log("🔍 Buscando logo en:", logoPath);

      // Verificar si el archivo existe
      if (!fs.existsSync(logoPath)) {
        console.error("❌ Archivo de logo no encontrado:", logoPath);
        return null;
      }

      // ... el resto del código igual
      const logoData = fs.readFileSync(logoPath);

      const imagenProcesada = await sharp(logoData)
        .ensureAlpha()
        .png({ transparency: true, compressionLevel: 9 })
        .toBuffer();

      const logoMarcaAgua = new ImageRun({
        data: imagenProcesada,
        transformation: { width: 400, height: 400 },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: AlignmentType.CENTER,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: AlignmentType.CENTER,
          },
          wrap: { type: TextWrappingType.BEHIND },
          zIndex: -9999,
        },
      });

      return logoMarcaAgua;
    } catch (error) {
      console.error("❌ Error procesando logo para marca de agua:", error);
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
    try {
      const doc = await this.testDocumentoMinimo();
      const buffer = await Packer.toBuffer(doc);

      // VERIFICACIONES CRÍTICAS:
      console.log("🔍 Verificando buffer...");
      console.log("📏 Tamaño buffer:", buffer.length, "bytes");
      console.log("🔢 Es Buffer?", Buffer.isBuffer(buffer));
      console.log("📝 Primeros bytes:", buffer.slice(0, 10).toString("hex"));

      // Un buffer DOCX válido debe empezar con PK (zip file)
      const primerosBytes = buffer.slice(0, 2).toString();
      console.log("🔍 Primeros 2 bytes:", primerosBytes);

      if (primerosBytes !== "PK") {
        throw new Error(
          "Buffer no es un archivo ZIP válido (DOCX). Bytes: " + primerosBytes
        );
      }

      // CREAR ARCHIVO LOCALMENTE
      const nombreArchivo = `test_documento_${Date.now()}.docx`;
      const rutaArchivo = path.join(process.cwd(), nombreArchivo);

      fs.writeFileSync(rutaArchivo, buffer);
      console.log("💾 Archivo guardado localmente:", rutaArchivo);
      console.log("✅ Verifica si este archivo se abre en Word");

      return buffer;
    } catch (error) {
      console.error("❌ Error crítico:", error);
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
      const diasSemana = [
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
      ];
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

      // Fila de información
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

      // Array para trackear rowSpans activos por día
      const rowSpansActivos = matrizHorario.map(() => ({
        activo: false,
        filasRestantes: 0,
      }));

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

        // Procesar cada día
        matrizHorario.forEach((dia, diaIndex) => {
          const celdaInfo = dia.horas[hora];
          const rowSpanInfo = rowSpansActivos[diaIndex];

          // Si hay un rowSpan activo, decrementar y saltar esta celda
          if (rowSpanInfo.activo) {
            rowSpanInfo.filasRestantes--;
            if (rowSpanInfo.filasRestantes === 0) {
              rowSpanInfo.activo = false;
            }
            return; // No agregar celda para este día
          }

          if (celdaInfo?.esContinuacion) {
            // No hacer nada - la celda ya está cubierta por rowSpan
            return;
          } else if (celdaInfo?.ocupado && celdaInfo.bloque === 0) {
            // Nueva clase que ocupa múltiples filas
            const clase = celdaInfo.datosClase;
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
                      DocumentServices.crearTextoEstilizado(
                        `Aula: ${clase.aula}`,
                        {
                          size: ESTILOS.tamanos.detalle,
                        }
                      )
                    ),
                  ]
                : []),
              DocumentServices.crearParrafoEstilizado(
                DocumentServices.crearTextoEstilizado(
                  `${clase.horaInicio} - ${clase.horaFin}`,
                  {
                    size: ESTILOS.tamanos.detalle,
                    color: ESTILOS.colores.textoGris,
                  }
                )
              ),
            ];

            celdas.push(
              DocumentServices.crearCeldaEstilizada(contenido, {
                rowSpan: celdaInfo.bloquesTotales,
                shading: { fill: ESTILOS.colores.fondoClase },
              })
            );

            // Activar el tracking de rowSpan
            rowSpansActivos[diaIndex] = {
              activo: true,
              filasRestantes: celdaInfo.bloquesTotales - 1,
            };
          } else {
            // Celda vacía
            celdas.push(
              DocumentServices.crearCeldaEstilizada([
                DocumentServices.crearParrafoEstilizado(""),
              ])
            );
          }
        });

        // Solo agregar la fila si tiene el número correcto de celdas
        if (celdas.length === 1 + matrizHorario.length) {
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
    /*
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
/*    */
    const doc = new Document({
      creator: "UPTAMCA",
      sections: [
        {
          properties: {
            page: {
              size: { orientation: PageOrientation.LANDSCAPE },
              margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
            },
          },
          // headers: { default: header }, // Temporalmente sin header
          children: [
            // Solo tabla básica sin estilos complejos
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              columnWidths: [2000, 2000, 2000],
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Lunes")] }),
                    new TableCell({ children: [new Paragraph("Martes")] }),
                    new TableCell({ children: [new Paragraph("Miércoles")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("07:00-08:30")] }),
                    new TableCell({ children: [new Paragraph("Libre")] }),
                    new TableCell({ children: [new Paragraph("09:00-10:30")] }),
                  ],
                }),
              ],
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

  static async testDocumentoMinimo() {
    try {
      const doc = new Document({
        creator: "Test",
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun("Test documento simple")],
              }),
            ],
          },
        ],
      });

      return doc;
    } catch (error) {
      console.error("❌ Error en test simple:", error);
      throw error;
    }
  }
}

export default DocumentServices;
