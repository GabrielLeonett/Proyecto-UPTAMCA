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
} from "docx";

// Leer la imagen del logo
const logoData = fs.readFileSync("./utils/LogoSimple.svg");

const logo = new ImageRun({
  data: logoData,
  transformation: {
    width: 100, // Tamaño más manejable
    height: 100, // Tamaño más manejable
  },
  floating: {
    horizontalPosition: {
      relative: HorizontalPositionRelativeFrom.PAGE,
      offset: 100, // Distancia desde el borde izquierdo
    },
    verticalPosition: {
      relative: VerticalPositionRelativeFrom.PAGE,
      offset: 100, // Distancia desde el borde superior
    },
  },
});

const table = new Table({
  columnWidths: [3505, 5505],
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: {
            size: 3505,
            type: WidthType.DXA,
          },
          children: [new Paragraph("Hello")],
        }),
        new TableCell({
          width: {
            size: 5505,
            type: WidthType.DXA,
          },
          children: [],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: {
            size: 3505,
            type: WidthType.DXA,
          },
          children: [],
        }),
        new TableCell({
          width: {
            size: 5505,
            type: WidthType.DXA,
          },
          children: [new Paragraph("World")],
        }),
      ],
    }),
  ],
});

const doc = new Document({
  creator: "Vicerrectorado academico UPTAMCA",
  title: "Horarios",
  styles: {
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        next: "Normal",
        run: {
          font: "Calibri Light",
          size: 56,
          bold: true,
          color: "2E74B5",
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        },
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: {
          font: "Calibri",
          size: 32,
          bold: true,
          color: "2E74B5",
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
        },
      },
      {
        id: "Normal",
        name: "Normal",
        basedOn: "Normal",
        next: "Normal",
        run: {
          font: "Arial",
          size: 24,
        },
      },
      {
        id: "Code",
        name: "Code",
        basedOn: "Normal",
        run: {
          font: "Courier New",
          size: 22,
          color: "FF0000",
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
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: [
        // Logo en la parte superior izquierda
        new Paragraph({
          children: [logo],
        }),

        // Título centrado
        new Paragraph({
          text: "HORARIOS - FORMATO HORIZONTAL",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("My Document.docx", buffer);
  console.log("Documento creado con logo en formato horizontal correctamente!");
});
