import React, { useState } from 'react';
import RegisProfe from './RegisProfe';
import InfoPer from './infoPer';
import InfoEduc from './infoEduc';

export default function RegistroProfesor() {
  const [step, setStep] = useState(1);

  // Opcional: almacenar datos entre pasos (puedes mejorarlo luego)
  const [formData, setFormData] = useState({
    datosPersonales: {},
    datosProfesionales: {},
    datosEducativos: {}
  });

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    // Aquí envías formData a tu backend o haces lo que necesites
    console.log('Formulario completo:', formData);
    alert('Formulario enviado exitosamente');
  };

  return (
    <>
      {step === 1 && (
        <RegisProfe
          onNext={handleNext}
          // Puedes pasar funciones para guardar datos si lo deseas
        />
      )}
      {step === 2 && (
        <InfoPer
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      {step === 3 && (
        <InfoEduc
          onPrev={handlePrev}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
