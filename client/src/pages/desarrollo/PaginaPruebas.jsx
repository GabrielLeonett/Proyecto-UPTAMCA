import { Box } from "@mui/material";
import NavBar from "../../components/navbar";
import SkeletonProfesores from "../../components/SkeletonProfesores";

export default function PaginaPruebas() {
  return (
    <>
      <NavBar backgroundColor />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <SkeletonProfesores />
        <SkeletonProfesores />
        <SkeletonProfesores />
      </Box>
    </>
  );
}
