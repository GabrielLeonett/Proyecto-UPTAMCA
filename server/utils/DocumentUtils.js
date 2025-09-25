import fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  PageOrientation,
  TextWrappingType,
  TextWrappingSide,
} from "docx";

// Leer la imagen del logo
const logoData = fs.readFileSync("./utils/LogoSimple.png");

// Crear el ImageRun con floating CORRECTO
const logo = new ImageRun({
  data: logoData,
  transformation: {
    width: 80, // Reducido para mejor ajuste
    height: 80, // Reducido para mejor ajuste
  },
  floating: {
    horizontalPosition: {
      relative: HorizontalPositionRelativeFrom.MARGIN,
      offset: 283, // ≈1 cm (28.35 puntos por cm)
    },
    verticalPosition: {
      relative: VerticalPositionRelativeFrom.MARGIN,
      offset: 283, // ≈1 cm
    },
    wrap: {
      type: TextWrappingType.SQUARE,
      side: TextWrappingSide.BOTH_SIDES,
    },
    zIndex: 1, // Importante: asegura que esté encima del texto
  },
});

const doc = new Document({
  creator: "Vicerrectorado academico UPTAMCA",
  title: "Horarios",
  styles: {
    paragraphStyles: [
      // ... (tus estilos existentes)
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
            top: 1440, // 1 pulgada = 1440 twips
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: [
        // Logo como párrafo independiente
        new Paragraph({
          children: [logo],
          spacing: { before: 0, after: 0 }, // Eliminar espacio alrededor
        }),

        new Table({
          rows: [
            // FILA 1
            new TableRow({
              children: [
                new TableCell({
                  rowSpan: 2,
                  children: [new Paragraph("Horaio")], // ✅ Correcto
                }),
                new TableCell({
                  children: [new Paragraph("Horaio")], // ✅ Correcto
                }),
              ],
            }),
            // FILA 2
            new TableRow({
              children: [
                // Se omite la celda con rowSpan
                new TableCell({
                  children: [new Paragraph("Horaio")], // ✅ Correcto
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("My Document.docx", buffer);
  console.log("Documento creado con logo correctamente!");
});
