import { Typography, TextField, Button } from "@mui/material";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Swal from "sweetalert2";
import PoliticaPrivacidad from "../pages/PoliticaPrivacidad";

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí puedes integrar tu lógica de envío (fetch/axios/emailjs)
    Swal.fire({
      icon: "success",
      title: "¡Mensaje enviado!",
      text: "Gracias por contactarnos, responderemos pronto.",
      confirmButtonColor: "#1E3A8A",
    });
  };

  return (
    <footer className="bg-[#0A2342] text-white py-14 mt-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
        
        {/* Información de contacto */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-[#1E3A8A] pb-2">
            Información de contacto
          </h3>
          <p className="mb-2">📍 Av. Universidad, Edificio Rectorado</p>
          <p className="mb-2">☎️ (0212) 555-1234</p>
          <p className="mb-2">✉️ contacto@uptamca.edu.ve</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-[#3B82F6] transition"><Facebook /></a>
            <a href="#" className="hover:text-[#3B82F6] transition"><Instagram /></a>
            <a href="#" className="hover:text-[#3B82F6] transition"><Twitter /></a>
            <a href="#" className="hover:text-[#3B82F6] transition"><Linkedin /></a>
          </div>
        </div>

        {/* Servicios académicos */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-[#1E3A8A] pb-2">
            Servicios académicos
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white transition">Carreras</a></li>
            <li><a href="#" className="hover:text-white transition">Biblioteca</a></li>
            <li><a href="#" className="hover:text-white transition">Laboratorios</a></li>
            <li><a href="#" className="hover:text-white transition">Calendario académico</a></li>
          </ul>
        </div>

        {/* Sección legal */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-[#1E3A8A] pb-2">
            Legal
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="/politicaPrivacidad" className="hover:text-white transition">Política de privacidad</a></li>
            <li><a href="/TerminosCondiciones" className="hover:text-white transition">Términos y condiciones</a></li>
            <li><a href="/Accesibilidad" className="hover:text-white transition">Accesibilidad</a></li>
          </ul>
        </div>

        {/* Formulario de contacto */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b-2 border-[#1E3A8A] pb-2">
            Contáctanos
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Nombre"
              InputProps={{ className: "bg-white rounded" }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Correo electrónico"
              type="email"
              InputProps={{ className: "bg-white rounded" }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              multiline
              rows={4}
              label="Mensaje"
              InputProps={{ className: "bg-white rounded" }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                background: "linear-gradient(to right, #1E3A8A, #3B82F6)",
                "&:hover": { background: "linear-gradient(to right, #0F2563, #2563EB)" },
                borderRadius: "0.75rem",
                paddingY: "0.6rem",
                textTransform: "none",
                fontWeight: "600",
              }}
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="mt-12 text-center border-t border-gray-700 pt-4">
        <Typography variant="body2" className="text-gray-400">
          © {new Date().getFullYear()} Universidad Politécnica Territorial. Todos los derechos reservados.
        </Typography>
      </div>
    </footer>
  );
}
