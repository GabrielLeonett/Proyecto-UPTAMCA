import { Card, CardContent } from "@mui/material";

const nucleos = [
  {
    nombre: "Núcleo Humanidades y Ciencias Sociales",
    pnfs: ["Psicología Social", "Educación Inicial"],
    mapa: "https://maps.app.goo.gl/btZszTXEJaQsgB9q8",
  },
  {
    nombre: "Núcleo Tecnología y Ciencias Administrativas",
    pnfs: ["Informática", "Administración", "Prevención y Salud en el Trabajo"],
    mapa: "https://maps.app.goo.gl/szDWv23dNYRACmzc8",
  },
  {
    nombre: "Núcleo Salud y Deporte",
    pnfs: ["Enfermería Integral Comunitaria", " Fisioterapia", "Terapia Ocupacional", "Deporte"],
    mapa: "https://maps.app.goo.gl/dxNMFQVB6VNus5os9",
  },
];

export default function Nucleos() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto grid gap-8 md:grid-cols-3 px-6">
        {nucleos.map((nucleo, index) => (
          <a
            key={index}
            href={nucleo.mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="block transform transition hover:scale-105"
          >
            <Card className="shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition">
              <div className="h-40 bg-gray-300 flex items-center justify-center text-gray-500">
                📍 Imagen del núcleo
              </div>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{nucleo.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4">{nucleo.descripcion}</p>
                <h4 className="font-bold">PNFs Presentes</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {nucleo.pnfs.map((pnf, i) => (
                    <li key={i} className="font-medium">
                      {pnf}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}
