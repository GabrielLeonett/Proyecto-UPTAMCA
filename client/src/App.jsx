import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";

import FormRegister from "./pages/registerProfesor";
import Index from "./pages/index";
import Profesores from "./pages/Profesores";
import Login from "./pages/login";

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}
