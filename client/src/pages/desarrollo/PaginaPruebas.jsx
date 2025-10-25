import { useState } from "react";
import NavBar from "../../components/navbar";
import FiltroAcordeonHorario from "../../components/FiltroAcordeonHorario";

export default function PaginaPruebas() {
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);

  const manejarSeleccionSeccion = (seccion) => {
    console.log("Sección seleccionada:", seccion);
    setSeccionSeleccionada(seccion);
  };

  return (
    <>
      <NavBar backgroundColor />
      <br />
      <br />
      <br />
      <br />
      <br />
      
      <FiltroAcordeonHorario
        onSeccionSelect={manejarSeleccionSeccion}
        selectedSeccion={seccionSeleccionada}
      />

      {/* Mostrar información de la sección seleccionada */}
      {seccionSeleccionada && (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <h3>Sección Seleccionada:</h3>
          <p><strong>PNF:</strong> {seccionSeleccionada.pnf} ({seccionSeleccionada.pnfCodigo})</p>
          <p><strong>Trayecto:</strong> {seccionSeleccionada.trayecto}</p>
          <p><strong>Sección:</strong> {seccionSeleccionada.numero}</p>
          <p><strong>Turno:</strong> {seccionSeleccionada.turno}</p>
          {seccionSeleccionada.aula && (
            <p><strong>Aula:</strong> {seccionSeleccionada.aula}</p>
          )}
          {seccionSeleccionada.capacidad && (
            <p><strong>Capacidad:</strong> {seccionSeleccionada.capacidad} estudiantes</p>
          )}
        </div>
      )}
    </>
  );
}