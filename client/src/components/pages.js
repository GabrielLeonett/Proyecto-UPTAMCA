// src/components/pages.js

const pages = [
  {
    name: "Inicio",
    url: "/",
    roles: ["publico", "Vicerrector", "Profesor", "Coordinador", "SuperAdmin"],
  },
  {
    name: "Profesor",
    roles: ["SuperAdmin", "Coordinador"],
    submenu: [
      {
        name: "Ver",
        url: "/Profesores",
        roles: ["SuperAdmin", "Coordinador"],
      },
      {
        name: "Registrar",
        url: "/registerProfesor",
        roles: ["SuperAdmin", "Coordinador"],
      },
    ],
  },
  {
    name: "PNF",
    roles: ["SuperAdmin", "Coordinador"],
    submenu: [
      {
        name: "Ver",
        url: "/PNF",
        roles: ["SuperAdmin", "Coordinador"],
      },
      {
        name: "Registrar",
        url: "/registerPNF",
        roles: ["SuperAdmin"],
      },
    ],
  },
  {
    name: "Horarios",
    url: "/Horarios",
    roles: ["Profesor", "Coordinador", "SuperAdmin"],
  },
  {
    name: "Administración",
    roles: ["SuperAdmin"],
    submenu: [
      { name: "Usuarios", url: "/admin/users", roles: ["SuperAdmin"] },
      { name: "Configuración", url: "/admin/settings", roles: ["SuperAdmin"] },
      { name: "Auditoría", url: "/admin/audit", roles: ["SuperAdmin"] },
    ],
  },
];

export default pages;
