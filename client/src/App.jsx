//Importaciones de los componentes para rutas y navegacion
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Importacion del componente que se encargara de permitir la entrada a vistas dependiendo de el rol de usuario
import { AuthProvider } from "./context/AuthContext";

//Importaciones para la creación de Modo oscuro y claro
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./components/ui/theme";

//importaciones de las paginas para su renderizado
// Vistas Públicas
import Inicio from "./pages/Inicio";
import InicioSesion from "./pages/InicioSesion";
import CerrarSesion from "./pages/CerrarSesion";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import DeclaracionAccesibilidad from "./pages/DeclaracionAccesibilidad";

// Gestión de Personal Académico
import GestionProfesores from "./pages/academico/GestionProfesores";
import RegistrarProfesor from "./pages/academico/RegistrarProfesor";
import DisponibilidadProfesor from "./pages/academico/DisponibilidadProfesor";

// Gestión de Coordinación
import GestionCoordinadores from "./pages/coordinacion/GestionCoordinadores";
import AsignarCoordinador from "./pages/coordinacion/AsignarCoordinador";

// Gestión de Programas de Formación
import ProgramasFormacion from "./pages/formacion/ProgramasFormacion";
import RegistrarPrograma from "./pages/formacion/RegistrarPrograma";
import GestionTrayectos from "./pages/formacion/GestionTrayectos";

// Gestión Curricular
import RegistrarUnidadCurricular from "./pages/curricular/RegistrarUnidadCurricular";

// Gestión de Secciones y Horarios
import GestionSecciones from "./pages/secciones/GestionSecciones";
import GestionHorarios from "./pages/horarios/GestionHorarios";

// Gestión de Infraestructura
import GestionSedes from "./pages/infraestructura/GestionSedes";
import RegistrarSede from "./pages/infraestructura/RegistrarSede";
import GestionAulas from "./pages/infraestructura/GestionAulas";
import RegistrarAula from "./pages/infraestructura/RegistrarAula";

// Administración del Sistema
import PanelAdministracion from "./pages/administracion/PanelAdministracion";

// Desarrollo y Pruebas
import PaginaPruebas from "./pages/desarrollo/PaginaPruebas";

//Importacion para la pagina 404 o notFound
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada";

//Importacion de useState
import { useState } from "react";

//Importacion de los estilos CSS
import "./App.css";

//Importacion para el Boton que cambia entre los temas claros y oscuros
import BotonCambiarTema from "./components/BotonCambiarTema";

//Imporatacion de Componente que Protege las vistas
import ProtectedViews from "./security/ProtectedViews";

// Roles comunes para reutilización
const ROLES = {
  TODOS_AUTENTICADOS: [
    "Vicerrector",
    "Profesor",
    "Coordinador",
    "Director General de Gestión Curricular",
    "SuperAdmin",
  ],
  ADMINISTRADORES: [
    "Vicerrector",
    "Director General de Gestión Curricular",
    "SuperAdmin",
  ],
  COORDINADORES: [
    "Vicerrector",
    "Coordinador",
    "Director General de Gestión Curricular",
    "SuperAdmin",
  ],
  PERSONAL_ACADEMICO: [
    "Vicerrector",
    "Profesor",
    "Coordinador",
    "Director General de Gestión Curricular",
    "SuperAdmin",
  ],
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline>
        <Router>
          <AuthProvider>
            <Routes>
              {/* === VISTAS PÚBLICAS === */}
              <Route path="/" element={<Inicio />} />
              <Route path="/iniciar-sesion" element={<InicioSesion />} />
              <Route path="/cerrar-sesion" element={<CerrarSesion />} />
              <Route
                path="/recuperar-contrasena"
                element={<RecuperarContrasena />}
              />
              <Route
                path="/terminos-condiciones"
                element={<TerminosCondiciones />}
              />
              <Route
                path="/politica-privacidad"
                element={<PoliticaPrivacidad />}
              />
              <Route
                path="/accesibilidad"
                element={<DeclaracionAccesibilidad />}
              />

              {/* === GESTIÓN DE PERSONAL ACADÉMICO === */}
              <Route
                path="/academico/profesores"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionProfesores />
                  </ProtectedViews>
                }
              />
              <Route
                path="/academico/profesores/registrar"
                element={
                  <ProtectedViews allowedRoles={ROLES.ADMINISTRADORES}>
                    <RegistrarProfesor />
                  </ProtectedViews>
                }
              />
              <Route
                path="/academico/profesores/:id/disponibilidad"
                element={
                  <ProtectedViews allowedRoles={ROLES.PERSONAL_ACADEMICO}>
                    <DisponibilidadProfesor />
                  </ProtectedViews>
                }
              />

              {/* === GESTIÓN DE COORDINACIÓN === */}
              <Route
                path="/coordinacion/coordinadores"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionCoordinadores />
                  </ProtectedViews>
                }
              />
              <Route
                path="/coordinacion/coordinadores/asignar"
                element={
                  <ProtectedViews allowedRoles={ROLES.ADMINISTRADORES}>
                    <AsignarCoordinador />
                  </ProtectedViews>
                }
              />

              {/* === PROGRAMAS NACIONALES DE FORMACIÓN === */}
              <Route
                path="/formacion/programas"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <ProgramasFormacion />
                  </ProtectedViews>
                }
              />
              <Route
                path="/formacion/programas/registrar"
                element={
                  <ProtectedViews allowedRoles={ROLES.ADMINISTRADORES}>
                    <RegistrarPrograma />
                  </ProtectedViews>
                }
              />
              <Route
                path="/formacion/programas/:codigo/trayectos/:trayecto"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionTrayectos />
                  </ProtectedViews>
                }
              />
              {/* === GESTIÓN CURRICULAR === */}
              <Route
                path="/curricular/unidades/registrar"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <RegistrarUnidadCurricular />
                  </ProtectedViews>
                }
              />

              {/* === GESTIÓN DE SECCIONES Y HORARIOS === */}
              <Route
                path="/secciones"
                element={
                  <ProtectedViews allowedRoles={ROLES.COORDINADORES}>
                    <GestionSecciones />
                  </ProtectedViews>
                }
              />
              <Route
                path="/horarios"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionHorarios />
                  </ProtectedViews>
                }
              />

              {/* === GESTIÓN DE INFRAESTRUCTURA === */}
              <Route
                path="/infraestructura/sedes"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionSedes />
                  </ProtectedViews>
                }
              />
              <Route
                path="/infraestructura/sedes/registrar"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <RegistrarSede />
                  </ProtectedViews>
                }
              />
              <Route
                path="/infraestructura/aulas"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <GestionAulas />
                  </ProtectedViews>
                }
              />
              <Route
                path="/infraestructura/aulas/registrar"
                element={
                  <ProtectedViews allowedRoles={ROLES.TODOS_AUTENTICADOS}>
                    <RegistrarAula />
                  </ProtectedViews>
                }
              />

              {/* === ADMINISTRACIÓN DEL SISTEMA === */}
              <Route
                path="/administracion"
                element={
                  <ProtectedViews allowedRoles={ROLES.ADMINISTRADORES}>
                    <PanelAdministracion />
                  </ProtectedViews>
                }
              />

              {/* === RUTAS DE DESARROLLO === */}
              <Route path="/desarrollo/pruebas" element={<PaginaPruebas />} />

              {/* === RUTA PARA PÁGINA NO ENCONTRADA === */}
              <Route path="*" element={<PaginaNoEncontrada />} />
            </Routes>
          </AuthProvider>
        </Router>
        <BotonCambiarTema setMode={setDarkMode} mode={darkMode} />
      </CssBaseline>
    </ThemeProvider>
  );
}
