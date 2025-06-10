import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";

import FormRegister from "./pages/registerProfesor";
import Index from "./pages/index";
import Profesores from "./pages/Profesores";
import Login from "./pages/login";
import HorarioForm from "./pages/registerHorario";
import PnfForm from "./pages/PnfFrom";
import MateriaForm from "./pages/Materia";

import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="" element={<Index />} />
          <Route path="/profesores" element={<Profesores />} />
          <Route path="/registerProfesor" element={<FormRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registerHorario" element={<HorarioForm />} />
          <Route path="/PnfFrom" element={<PnfForm />} />
         <Route path="/Materia" element={<MateriaForm />} />
          {/* Puedes agregar más rutas aquí */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
