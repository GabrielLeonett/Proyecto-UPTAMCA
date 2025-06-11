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
import Login from "./pages/login";
import HorarioForm from "./pages/registerHorario";
import PnfForm from "./pages/PnfFrom";
import MateriaForm from "./pages/Materia";
import PNF from "./pages/PNF";
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

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Vistas Públicas */}
              <Route path="" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* Vistas Protegidas */}
              <Route
                path="/profesores"
                element={
                  <ProtectedViews
                    allowedRoles={[
                      "Vicerrector",
                      "Profesor",
                      "Coordinador",
                      "Director General de Gestión Curricular",
                    ]}
                  >
                    <Profesores />
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerProfesor"
                element={
                  <ProtectedViews allowedRoles={["Vicerrector", "Profesor", "Coordinador", "Director General de Gestión Curricular",]}>
                    <FormRegister />
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerPNF"
                element={
                  <ProtectedViews allowedRoles={["Vicerrector", "Profesor", "Coordinador", "Director General de Gestión Curricular",]}>
                    <PnfForm/>
                  </ProtectedViews>
                }
              />
              <Route
                path="/RegistrarHorario"
                element={
                  <ProtectedViews allowedRoles={["Vicerrector", "Profesor", "Coordinador", "Director General de Gestión Curricular",]}>
                    <HorarioForm/>
                  </ProtectedViews>
                }
              />
              <Route
                path="/registerUnidadCurricular"
                element={
                  <ProtectedViews allowedRoles={["Vicerrector", "Profesor", "Coordinador", "Director General de Gestión Curricular",]}>
                    <MateriaForm/>
                  </ProtectedViews>
                }
              />
              <Route
                path="/PNF"
                element={
                  <ProtectedViews allowedRoles={["Vicerrector", "Profesor", "Coordinador", "Director General de Gestión Curricular",]}>
                    <PNF/>
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
