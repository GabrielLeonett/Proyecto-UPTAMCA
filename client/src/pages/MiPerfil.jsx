import React, { useEffect, useState, useContext } from "react";
import CustomButton from "../components/customButton";
import { Card, CardContent } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { AuthContext } from "../context/AuthContext"; // donde manejas tu login/token
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MiPerfil = () => {
  const { usuario, token } = useContext(AuthContext); // obtiene datos del usuario logueado
  const [perfil, setPerfil] = useState(null);
  const [modo, setModo] = useState("profesor");
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/usuario/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPerfil(res.data);
      } catch (error) {
        console.error("Error al obtener perfil:", error);
      }
    };

    obtenerPerfil();
  }, [token]);

  if (!perfil) return <p className="text-center mt-8 text-gray-600">Cargando perfil...</p>;

  // Determinar rol actual (por modo)
  const rolActivo =
    perfil.roles.includes("Coordinador") && modo === "coordinador"
      ? "Coordinador"
      : perfil.rol;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Mi Perfil</h1>

      {/* Si es profesor y coordinador */}
      {perfil.roles.includes("Profesor") && perfil.roles.includes("Coordinador") && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Modo actual:</span>
          <Switch
            checked={modo === "coordinador"}
            onCheckedChange={(v) => setModo(v ? "coordinador" : "profesor")}
          />
          <span className="font-medium">
            {modo === "profesor" ? "Profesor" : "Coordinador"}
          </span>
        </div>
      )}

      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              {perfil.nombre} {perfil.apellido}
            </h2>
            <p className="text-gray-500">{perfil.correo}</p>
            <p className="text-sm text-gray-500">
              Rol activo: <span className="font-medium">{rolActivo}</span>
            </p>
          </div>

          {/* SECCIONES SEGÚN EL ROL */}
          {rolActivo === "Profesor" && (
            <div className="space-y-2">
              <CustomButton text="Ver datos personales" onClick={() => navigate("/datos-personales")} />
              <CustomButton text="Ver horario" onClick={() => navigate("/horario-profesor")} />
              <CustomButton text="Ver carga" onClick={() => navigate("/carga-academica")} />
              <CustomButton text="Notificaciones" onClick={() => navigate("/notificaciones")} />
              <CustomButton text="Solicitar corrección" onClick={() => navigate("/tickets")} />
            </div>
          )}

          {rolActivo === "Coordinador" && (
            <div className="space-y-2">
              <CustomButton text="Ver / editar horarios" onClick={() => navigate("/gestion-horarios")} />
              <CustomButton text="Asignar profesores" onClick={() => navigate("/asignar-profesores")} />
              <CustomButton text="Eliminar / restaurar profesores" onClick={() => navigate("/eliminar-profesores")} />
              <CustomButton text="Gestionar disponibilidad" onClick={() => navigate("/disponibilidad")} />
            </div>
          )}

          {rolActivo === "Director General de Gestión Curricular" && (
            <div className="space-y-2">
              <CustomButton text="Supervisar planificaciones" onClick={() => navigate("/planificaciones")} />
              <CustomButton text="Gestionar profesores" onClick={() => navigate("/profesores")} />
              <CustomButton text="Ver reportes" onClick={() => navigate("/reportes")} />
            </div>
          )}

          {rolActivo === "Vicerrector" && (
            <div className="space-y-2">
              <CustomButton text="Ver indicadores" onClick={() => navigate("/indicadores")} />
              <CustomButton text="Eliminar / restaurar profesores" onClick={() => navigate("/eliminar-profesores")} />
            </div>
          )}

          {rolActivo === "SuperAdmin" && (
            <div className="space-y-2">
              <CustomButton text="Administrar usuarios" onClick={() => navigate("/usuarios")} />
              <CustomButton text="Ver reportes globales" onClick={() => navigate("/reportes-globales")} />
              <CustomButton text="Control total del sistema" onClick={() => navigate("/admin")} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MiPerfil;
