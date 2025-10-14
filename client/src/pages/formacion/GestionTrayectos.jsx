import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../apis/axios";
import Swal from "sweetalert2";
import CustomButton from "../components/CustomButton";
import ModalRegistroSeccion from "../components/ModalRegistroSeccion";
=======
import { useParams, useNavigate } from "react-router-dom";
import ResponsiveAppBar from "../../components/navbar";
import {
  Box,
  CircularProgress,
  Grid,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import CardTrayecto from "../../components/cardTrayecto";
import useApi from "../../hook/useApi";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a

export default function PNF() {
  const axios = useApi();

  const { codigoPNF } = useParams();
  const navigate = useNavigate(); // ← Agregar useNavigate
  const [trayectos, setTrayectos] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [openModalSeccion, setOpenModalSeccion] = useState(false);
  const navigate = useNavigate();
=======
  const [error, setError] = useState(null);
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a

  useEffect(() => {
    const pedirTrayectos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/Trayectos?PNF=${codigoPNF}`);
        setTrayectos(res);
      } finally {
        setLoading(false);
      }
    };

    pedirTrayectos();
  }, [codigoPNF]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

<<<<<<< HEAD
      <Box sx={{ mt: 18, px: 4, pb: 10 }}>
        {/* Breadcrumb */}
=======
      <Box sx={{ pt: 12, px: 5 }}>
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a
        <Box sx={{ mt: 5 }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => navigate("/PNFS")}
            >
              PNFS
            </Link>

            <Link component="button" underline="hover" color="inherit" disabled>
              {codigoPNF}
            </Link>
          </Breadcrumbs>
        </Box>
<<<<<<< HEAD

        {/* Secciones */}
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
        >
          Secciones del Trayecto
        </Typography>
=======
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : trayectos.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron trayectos para este PNF
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {trayectos.map((trayecto) => (
              <Grid item xs={12} sm={6} md={4} key={trayecto.id}>
                <CardTrayecto Trayecto={trayecto} codigoPNF={codigoPNF} />
              </Grid>
            ))}
          </Grid>
<<<<<<< HEAD
        ) : (
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              No hay secciones registradas.
            </Typography>
            <CustomButton
              tipo="primary"
              onClick={() => setOpenModalSeccion(true)}
            >
              Registrar Sección
            </CustomButton>
          </Box>
        )}

        {/* Unidades Curriculares */}
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
        >
          Unidades Curriculares
        </Typography>

        {loading ? (
          <Typography color="text.secondary" textAlign="center">
            Cargando...
          </Typography>
        ) : unidades.length > 0 ? (
          <Grid container spacing={2} justifyContent="center">
            {unidades.map((uc) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={uc.id_unidad_curricular}
                display="flex"
                justifyContent="center"
              >
                <CardUnidadCurricular unidadCurricular={uc} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              No hay unidades curriculares registradas.
            </Typography>
            <CustomButton
              tipo="primary"
              onClick={() =>
                navigate("/registerUnidadCurricular", {
                  state: { idTrayecto: Trayecto },
                })
              }
            >
              Registrar Unidad Curricular
            </CustomButton>
          </Box>
=======
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a
        )}

        {/* Modal de Registro de Sección */}
        <ModalRegistroSeccion
          open={openModalSeccion}
          handleClose={() => setOpenModalSeccion(false)}
          idTrayecto={Trayecto}
        />
      </Box>
    </>
  );
}
