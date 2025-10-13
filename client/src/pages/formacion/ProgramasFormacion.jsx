import { useEffect, useState } from "react";
import ResponsiveAppBar from "../components/navbar";
import { Typography, Box, CircularProgress } from "@mui/material";
import CardPNF from "../components/cardPNF";
import useApi from "../hook/useApi"; // Added import for axios

export default function ProgramasFormacion() {
  const [PNFS, setPNFS] = useState([]);
  const [loading, setLoading] = useState(true);
  const axios = useApi();

  useEffect(() => {
    const fetchPNFS = async () => {
      const data = await axios.get("/PNF");
      setPNFS(data);
      setLoading(false);
    };

    fetchPNFS();
  }, []);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ pt: 12, px: 5 }}>
        <Typography component="h1" variant="h4" sx={{ mt: 4, mr: 4 }}>
          Programas Nacionales de Formación (PNF)
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {PNFS.map((PNF) => (
              <CardPNF
                key={PNF.codigo_pnf} // Asegúrate de tener una key única
                pnf={{
                  name: PNF.nombre_pnf,
                  codigo: PNF.codigo_pnf,
                  poblacion: PNF.poblacion_estudiantil_pnf,
                  descripcion: PNF.descripcion_pnf,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </>
  );
}
