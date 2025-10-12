import { Box, Typography, Grid, Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CardUnidadCurricular from "../../components/cardUnidadCurricular";
import CardSeccion from "../../components/cardSeccion";
import ResponsiveAppBar from "../../components/navbar";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../apis/axios";
import Swal from "sweetalert2";
import CustomButton from "../components/CustomButton";
import ModalRegistroSeccion from "../components/ModalRegistroSeccion";

export default function GestionTrayectos() {
  const { codigoPNF, Trayecto } = useParams();
  const [unidades, setUnidades] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModalSeccion, setOpenModalSeccion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!Trayecto) {
      Swal.fire({
        title: "Trayecto No Seleccionado",
        text: "No se ha seleccionado ningún trayecto. Por favor, regresa a la página anterior y selecciona un trayecto válido.",
        icon: "warning",
      });
    }
  }, [Trayecto]);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await axios.get(
          `/Trayecto/Unidades-Curriculares?Trayecto=${Trayecto}`
        );
        setUnidades(response.data.data || []);
      } catch (err) {
        console.error("Error cargando unidades curriculares:", err);
      }
    };

    const fetchSecciones = async () => {
      try {
        const response = await axios.get(`/Secciones/?Trayecto=${Trayecto}`);
        setSecciones(response.data.data || []);
      } catch (err) {
        console.error("Error cargando secciones:", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUnidades(), fetchSecciones()]);
      setLoading(false);
    };

    loadData();
  }, [Trayecto]);

  return (
    <>
      <ResponsiveAppBar backgroundColor />

      <Box sx={{ mt: 18, px: 4, pb: 10 }}>
        {/* Breadcrumb */}
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

            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => {
                navigate(`/PNF/${codigoPNF}`);
              }}
            >
              {codigoPNF}
            </Link>

            <Link component="button" underline="hover" color="inherit" disabled>
              {Trayecto}
            </Link>
          </Breadcrumbs>
        </Box>

        {/* Secciones */}
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
        >
          Secciones del Trayecto
        </Typography>

        {loading ? (
          <Typography color="text.secondary" textAlign="center">
            Cargando...
          </Typography>
        ) : secciones.length > 0 ? (
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 6 }}>
            {secciones.map((seccion) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={seccion.id}
                display="flex"
                justifyContent="center"
              >
                <CardSeccion seccion={seccion} />
              </Grid>
            ))}
          </Grid>
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
