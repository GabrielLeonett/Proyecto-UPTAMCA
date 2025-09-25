import { useEffect, useState } from "react";
import ResponsiveAppBar from "../components/navbar";
import {
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CardPNF from "../components/cardPNF";
import { pedirPNFApi } from "../apis/PNFApi";

export default function PNFS() {
  const [PNFS, setPNFS] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPNFS = async () => {
      const data = await pedirPNFApi();
      console.log(data);
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
