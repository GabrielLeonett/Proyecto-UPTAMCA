//Importaciones de los componentes para rutas y navegacion
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Importacion del componente que se encargara de permitir la entrada a vistas dependiendo de el rol de usuario
import { AuthProvider } from "./context/AuthContext";

//Importaciones para la creación de Modo oscuro y claro
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./components/ui/theme";

//importaciones de las paginas para su renderizado
import FormRegister from "./pages/registerProfesor";
import Index from "./pages/index";
import Profesores from "./pages/Profesores";
import Coordinadores from "./pages/Coordinadores";
import IniciarSession from "./pages/inicioSession";
import CerrarSession from "./pages/cerrarSession";
import CambiarContraseña from "./pages/cambiarContraseña";
import PnfForm from "./pages/PnfFrom";
import RegisterUnidadCurricular from "./pages/RegisterUnidadCurricular";
import Prueba from "./pages/prueba";
import PNFS from "./pages/PNFS";
import Horarios from "./pages/Horarios";
import RegisterSede from "./pages/registerSede";
import PNF from "./pages/PNF";
import AsignarCoordinador from "./pages/AsignarCoordinador";

//Importacion para la pagina 404 o notFound
import NotFound from "./pages/NotFound";

//Importacion de useState
import { useState } from "react";

//Importacion de los estilos CSS
import "./App.css";

//Importacion para el Boton que cambia entre los temas claros y oscuros
import ButtonChageTheme from "./components/buttonChageTheme";

//Imporatacion de Componente que Protege las vistas
import ProtectedViews from "./security/ProtectedViews";
import Secciones from "./pages/Secciones";
import Disponibilidad from "./pages/disponibilidadDoc";
import EliminarProfesor from "./pages/eliminarProfesor";

//Importacion para Politica de Privacidad
import PoliticaPrivacidad from "./pages/poliPriv";
import TerminosCondiciones from "./pages/terminosCondi";
import Accesibilidad from "./pages/accesibilidad";
import Trayectos from "./pages/Trayecto";
import ViewSede from "./pages/Sedes";
import RegisterAula from "./pages/RegisterAula";
import ViewAula from "./pages/Aulas";
import AssignCoordinador from "./pages/AsignarCoordinador";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Vistas Públicas */}
              <Route path="" element={<Index />} />
              <Route path="/Inicio-session" element={<IniciarSession />} />
              <Route path="/Cerrar-session" element={<CerrarSession />} />
              <Route
                path="/Cambiar-contraseña"
                element={<CambiarContraseña />}
              />

              {/* Vistas Protegidas */}
              <Route
                path="/Profesores"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Profesores />
                  </ProtectedViews>
                }
              />
              <Route
                path="/Coordinadores"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Coordinadores />
                  </ProtectedViews>
                }
              />
              <Route
                path="/Coordinadores/asignar"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <AsignarCoordinador />
                  </ProtectedViews>
                }
              />
              <Route
                path="/RegisterUnidadCurricular"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <RegisterUnidadCurricular />
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerSede"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <RegisterSede />
                  </ProtectedViews>
                }
              />
              <Route
                path="/Horarios"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Horarios />
                  </ProtectedViews>
                }
              />
              <Route
                path="/PNF/:codigoPNF"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <PNF />
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerProfesor"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <FormRegister />
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerPNF"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <PnfForm />
                  </ProtectedViews>
                }
              />
              <Route path="/Prueba" element={<Prueba />} />
              <Route
                path="PNFS/"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <PNFS />
                  </ProtectedViews>
                }
              />

              <Route
                path="/Secciones"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                    ]}
                  >
                    <Secciones />
                  </ProtectedViews>
                }
              />

              <Route
                path="/profesor/:id_profesor/disponiblidad"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Disponibilidad />
                  </ProtectedViews>
                }
              />

              <Route
                path="/eliminarProfesor"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <EliminarProfesor />
                  </ProtectedViews>
                }
              />
              <Route
                path="/politicaPrivacidad"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <PoliticaPrivacidad />
                  </ProtectedViews>
                }
              />

              <Route
                path="/TerminosCondiciones"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <TerminosCondiciones />
                  </ProtectedViews>
                }
              />

              <Route
                path="/Accesibilidad"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Accesibilidad />
                  </ProtectedViews>
                }
              />

              <Route
                path="/PNF/:codigoPNF/Trayecto/:Trayecto"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <Trayectos />
                  </ProtectedViews>
                }
              />

              <Route
                path="/Sedes"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <ViewSede />
                  </ProtectedViews>
                }
              />
              <Route
                path="/RegisterAula"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <RegisterAula />
                  </ProtectedViews>
                }
              />
              <Route
                path="/Aulas"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <ViewAula />
                  </ProtectedViews>
                }
              />

              <Route
                path="/AssignCoordinador"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                      "SuperAdmin",
                    ]}
                  >
                    <AssignCoordinador />
                  </ProtectedViews>
                }
              />

              {/* Ruta para 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
        <ButtonChageTheme setMode={setDarkMode} mode={darkMode} />
      </CssBaseline>
    </ThemeProvider>
  );
}
