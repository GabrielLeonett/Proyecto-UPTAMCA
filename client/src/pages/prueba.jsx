import CustomButton from "../components/customButton";
import NavBar from "../components/navbar";
import useApi from "../hook/useApi";


export default function Prueba() {
  const api = useApi();
  const datos = {
    cedula: "31264460",
    apellidos: "Leonett Armas",
    email: "delegadogabrielleonett@gmail.com",
    direccion: "Av. Bermúdez, Los Teques",
    telefono_movil: "04142245310",
    telefono_local: null,
    fecha_nacimiento: "11-11-2004",
    genero: "masculino",
    fecha_ingreso: "11-03-2021",
    dedicacion: "Convencional",
    categoria: "Instructor",
    area_de_conocimiento: ["Matematicas"],
    pre_grado: [
      {
        id_pre_grado: 1,
        nombre_pre_grado: "Licenciatura en Informática",
        tipo_pre_grado: "Licenciatura",
      },
    ],
    pos_grado: [
      {
        id_pos_grado: 1,
        nombre_pos_grado: "Maestría en Inteligencia Artificial",
        tipo_pos_grado: "Maestría",
      },
    ],
  };
  // Si quieres usar showAlert, considera hacerlo en un efecto o evento
  const handleTestAlert = () => {
    api.post("/Profesor/register", datos);
  };

  return (
    <>
      <NavBar backgroundColor={true} />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <CustomButton onClick={handleTestAlert}>Probar Alert</CustomButton>
    </>
  );
}
