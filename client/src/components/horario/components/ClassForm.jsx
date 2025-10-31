import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import CustomButton from "../../customButton";

// Formulario para crear nueva clase
const ClassForm = ({
  unidadCurricularSelected,
  unidadesCurriculares,
  profesores,
  profesorSelected,
  aulas,
  aulaSelected,
  onUnidadChange,
  onProfesorChange,
  onAulaChange,
  Custom = true,
  loading = false,
  errors = {},
  ButtonSave,
  ButtonCancel,
}) => {
  const theme = useTheme();

  if (!Custom) {
    return null;
  }

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: theme.palette.primary.main,
          }}
        >
          <SchoolIcon />
          Crear Nueva Clase
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Unidad Curricular */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" error={!!errors.unidad}>
              <InputLabel id="unidad-curricular-label">
                Unidad Curricular
              </InputLabel>
              <Select
                labelId="unidad-curricular-label"
                value={unidadCurricularSelected?.id_unidad_curricular || ""}
                onChange={(e) => onUnidadChange(e.target.value)}
                label="Unidad Curricular"
                startAdornment={
                  <SchoolIcon sx={{ mr: 1, color: "text.secondary" }} />
                }
                disabled={loading}
              >
                {unidadesCurriculares.length > 0 ? (
                  unidadesCurriculares
                    .filter((unidad) => unidad.esVista !== true)
                    .map((unidad) => (
                      <MenuItem
                        key={unidad.id_unidad_curricular}
                        value={unidad.id_unidad_curricular}
                      >
                        <Box>
                          <Typography variant="body1">
                            {unidad.nombre_unidad_curricular}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {unidad.horas_clase} horas •{" "}
                            {unidad.codigo_unidad_curricular}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {loading
                        ? "Cargando unidades..."
                        : "No hay unidades disponibles"}
                    </Typography>
                  </MenuItem>
                )}
              </Select>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Seleccione la unidad curricular a programar
              </Typography>
            </FormControl>
          </Grid>

          {/* Profesor - Solo se muestra si hay unidad seleccionada */}
          {unidadCurricularSelected && (
            <Grid item xs={12} md={4}>
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.profesor}
              >
                <InputLabel id="profesor-label">Profesor</InputLabel>
                <Select
                  labelId="profesor-label"
                  value={profesorSelected?.id_profesor || ""}
                  onChange={(e) => onProfesorChange(e.target.value)}
                  label="Profesor"
                  startAdornment={
                    <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }
                  disabled={loading}
                >
                  {profesores.length > 0 ? (
                    profesores.map((profesor) => (
                      <MenuItem
                        key={profesor.id_profesor}
                        value={profesor.id_profesor}
                      >
                        <Box>
                          <Typography variant="body1">
                            {profesor.nombres.split(" ")[0]}{" "}
                            {profesor.apellidos.split(" ")[0]}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {loading
                          ? "Cargando profesores..."
                          : "No hay profesores disponibles"}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Seleccione el profesor asignado
                </Typography>
              </FormControl>
            </Grid>
          )}

          {/* Aula - Solo se muestra si hay profesor seleccionado */}
          {profesorSelected && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" error={!!errors.aula}>
                <InputLabel id="aula-label">Aula</InputLabel>
                <Select
                  labelId="aula-label"
                  value={aulaSelected?.id_aula || ""}
                  onChange={(e) => onAulaChange(e.target.value)}
                  label="Aula"
                  startAdornment={
                    <RoomIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }
                  disabled={loading}
                >
                  {aulas.length > 0 ? (
                    aulas.map((aula) => (
                      <MenuItem key={aula.id_aula} value={aula.id_aula}>
                        <Box>
                          <Typography variant="body1">
                            {aula.codigo_aula}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Capacidad: {aula.capacidad_aula} • {aula.tipo_aula}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {loading
                          ? "Cargando aulas..."
                          : "No hay aulas disponibles"}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Seleccione el aula para la clase
                </Typography>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Grid sx={{ m: 3, gap: 3 }} container>
          <CustomButton
            tipo="success"
            onClick={() => {
              ButtonSave();
            }}
          >
            <SaveIcon />
            <Typography sx={{ ml: 1 }}>Guardar Cambios</Typography>
          </CustomButton>
          <CustomButton
            tipo="error"
            onClick={() => {
              ButtonCancel();
            }}
          >
            <CancelIcon /> {/* Icono diferente para cancelar */}
            <Typography sx={{ ml: 1 }}>Cancelar Cambios</Typography>{" "}
            {/* Texto diferente */}
          </CustomButton>
        </Grid>

        {/* Instrucciones */}
        {!unidadCurricularSelected && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Seleccione una unidad curricular para comenzar a crear la clase.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassForm;
