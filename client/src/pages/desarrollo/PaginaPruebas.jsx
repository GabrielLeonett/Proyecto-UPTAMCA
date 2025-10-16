import NavBar from "../../components/navbar";

export default function PaginaPruebas() {
  return (
    <>
      <NavBar backgroundColor></NavBar>
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1>{import.meta.env.VITE_APP_NAME}</h1>
      <p>Versión: {import.meta.env.VITE_APP_VERSION}</p>
      <p>Servidor: {import.meta.env.VITE_SERVER_URL}</p>
    </>
  );
}
