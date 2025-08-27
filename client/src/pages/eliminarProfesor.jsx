import { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from "lucide-react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Servicio mock
const TeacherService = {
  teachers: [
    { id: 1, nombre: "Juan Pérez", cedula: "12345678", pnf: "Informática", estado: "Activo" },
    { id: 2, nombre: "María Gómez", cedula: "87654321", pnf: "Electrónica", estado: "Activo" },
  ],
  logs: [],
  list() { return this.teachers; },
  deactivate(id, motivo, detalle) {
    const t = this.teachers.find(x => x.id === id);
    if (t) {
      t.estado = "Inactivo";
      this.logs.push({ ...t, motivo, detalle, fecha: new Date().toLocaleString(), usuario: "admin" });
    }
  },
  restore(id) {
    const t = this.teachers.find(x => x.id === id);
    if (t) t.estado = "Activo";
  },
  getLogs() { return this.logs; }
};

// Componente de botón reutilizable
function Button({ color = "blue", size = "md", icon, text, onClick }) {
  const baseClasses = "flex items-center gap-1 font-medium rounded transition-colors";
  const sizeClasses = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2 text-base";
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
    gray: "bg-gray-500 hover:bg-gray-600 text-white",
  }[color];

  return (
    <button className={`${baseClasses} ${sizeClasses} ${colorClasses}`} onClick={onClick}>
      {icon} {text}
    </button>
  );
}

export default function EliminarProfesor() {
  const [teachers, setTeachers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTeachers(TeacherService.list());
    setLogs(TeacherService.getLogs());
  }, []);

  // Función para desactivar con SweetAlert
  const handleDeactivateModal = (profesor) => {
    Swal.fire({
      title: `Desactivar Profesor: ${profesor.nombre}`,
      html: `
        <input type="text" id="motivo" class="swal2-input" placeholder="Motivo (obligatorio)">
        <input type="text" id="detalle" class="swal2-input" placeholder="Detalle (opcional)">
      `,
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const motivo = Swal.getPopup().querySelector('#motivo').value;
        const detalle = Swal.getPopup().querySelector('#detalle').value;
        if (!motivo.trim()) {
          Swal.showValidationMessage(`El motivo es obligatorio`);
        }
        return { motivo, detalle };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        TeacherService.deactivate(profesor.id, result.value.motivo, result.value.detalle);
        setTeachers([...TeacherService.list()]);
        setLogs([...TeacherService.getLogs()]);
        Swal.fire('Profesor desactivado', '', 'success');
      }
    });
  };

  const handleRestore = (id) => {
    TeacherService.restore(id);
    setTeachers([...TeacherService.list()]);
    Swal.fire('Profesor restaurado', '', 'success');
  };

  const filtered = teachers.filter(t =>
    t.nombre.toLowerCase().includes(search.toLowerCase()) ||
    t.cedula.includes(search)
  );

  return (
    <div className="p-6 grid gap-6">
      {/* Gestión de Profesores */}
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Gestión de Profesores</h2>
        <input
          className="border px-3 py-2 rounded w-full mb-4"
          placeholder="Buscar por nombre o cédula"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Cédula</th>
              <th className="p-2">PNF</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.nombre}</td>
                <td className="p-2">{t.cedula}</td>
                <td className="p-2">{t.pnf}</td>
                <td className="p-2">{t.estado}</td>
                <td className="p-2 flex gap-2">
                  {t.estado === "Activo" ? (
                    <Button
                      color="red"
                      size="sm"
                      onClick={() => handleDeactivateModal(t)}
                      icon={<Trash2 className="w-4 h-4" />}
                      text="Eliminar"
                    />
                  ) : (
                    <Button
                      color="gray"
                      size="sm"
                      onClick={() => handleRestore(t.id)}
                      icon={<RefreshCw className="w-4 h-4" />}
                      text="Restaurar"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial */}
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Historial de Eliminaciones</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Cédula</th>
              <th className="p-2">Motivo</th>
              <th className="p-2">Detalle</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{log.nombre}</td>
                <td className="p-2">{log.cedula}</td>
                <td className="p-2">{log.motivo}</td>
                <td className="p-2">{log.detalle}</td>
                <td className="p-2">{log.fecha}</td>
                <td className="p-2">{log.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
