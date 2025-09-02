export const UTILS = {
  obtenerDiaId: (dia) => {
    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    return dias.indexOf(dia.toLowerCase());
  },

  obtenerDiaNombre: (id) => {
    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    return dias[id] || "";
  },

  sumar45Minutos: (horaMilitar, multiplicar) => {
    const tiempo = parseInt(horaMilitar, 10);
    const horas = Math.floor(tiempo / 100);
    const minutos = tiempo % 100;
    const totalMinutos = horas * 60 + minutos;
    const nuevoTotalMinutos = totalMinutos + 45 * multiplicar;
    let nuevasHoras = Math.floor(nuevoTotalMinutos / 60);
    const nuevosMinutos = nuevoTotalMinutos % 60;

    if (nuevasHoras >= 24) nuevasHoras -= 24;

    const resultado = nuevasHoras * 100 + nuevosMinutos;
    return resultado.toString().padStart(4, "0");
  },

sumar45MinutosHHMM: (horaMilitar, multiplicar) => {
    const tiempo = parseInt(horaMilitar, 10);
    const horas = Math.floor(tiempo / 100);
    const minutos = tiempo % 100;
    const totalMinutos = horas * 60 + minutos;
    const nuevoTotalMinutos = totalMinutos + 45 * multiplicar;
    
    let nuevasHoras = Math.floor(nuevoTotalMinutos / 60);
    const nuevosMinutos = nuevoTotalMinutos % 60;

    // Manejar overflow de horas (más de 24 horas)
    if (nuevasHoras >= 24) {
        nuevasHoras = nuevasHoras % 24;
    }

    // Formatear correctamente a HH:MM
    const horasFormateadas = nuevasHoras.toString().padStart(2, '0');
    const minutosFormateados = nuevosMinutos.toString().padStart(2, '0');
    
    const resultado = `${horasFormateadas}:${minutosFormateados}:00`;
    
    console.log("Resultado formateado:", resultado);
    return resultado;
},

  formatearHora: (horaMilitar) => {
    const horas = Math.floor(horaMilitar / 100);
    const minutos = horaMilitar % 100;
    const periodo = horas >= 12 ? "PM" : "AM";
    const horas12 = horas > 12 ? horas - 12 : horas === 0 ? 12 : horas;

    return `${horas12}:${String(minutos).padStart(2, "0")} ${periodo}`;
  },
  obtenerTrayectoNumero(trayecto) {
    const trayectos = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
    return trayectos[trayecto] || 1;
  },
  horasMinutos(h, m) {
    return parseInt(h) * 60 + parseInt(m);
  },
  calcularHorasHHMM(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return h * 100 + m;
  },
};
