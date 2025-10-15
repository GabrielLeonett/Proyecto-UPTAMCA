import React from 'react';
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
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Room as RoomIcon
} from '@mui/icons-material';

// Formulario para crear nueva clase
const ClassForm = ({
  newClass,
  unidadesCurriculares,
  profesores,
  aulas,
  onUnidadChange,
  onProfesorChange,
  onAulaChange,
  Custom = true,
  loading = false,
  errors = {}
}) => {
  const theme = useTheme();

  if (!Custom) {
    return null;
  }

  const getUnidadText = (unidad) => {
    return `${unidad.nombre_unidad_curricular} (${unidad.horas_clase}h)`;
  };

  const getProfesorText = (profesor) => {
    return `${profesor.nombres} ${profesor.apellidos}`;
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.primary.main
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
                value={newClass.unidad?.id_unidad_curricular || ''}
                onChange={(e) => onUnidadChange(e.target.value)}
                label="Unidad Curricular"
                startAdornment={<SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />}
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
                            {unidad.horas_clase} horas • {unidad.codigo_unidad_curricular}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Cargando unidades...' : 'No hay unidades disponibles'}
                    </Typography>
                  </MenuItem>
                )}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Seleccione la unidad curricular a programar
              </Typography>
            </FormControl>
          </Grid>

          {/* Profesor - Solo se muestra si hay unidad seleccionada */}
          {newClass.unidad && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" error={!!errors.profesor}>
                <InputLabel id="profesor-label">Profesor</InputLabel>
                <Select
                  labelId="profesor-label"
                  value={newClass.profesor?.id_profesor || ''}
                  onChange={(e) => onProfesorChange(e.target.value)}
                  label="Profesor"
                  startAdornment={<PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />}
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
                            {profesor.nombres} {profesor.apellidos}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {profesor.cedula}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Cargando profesores...' : 'No hay profesores disponibles'}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Seleccione el profesor asignado
                </Typography>
              </FormControl>
            </Grid>
          )}

          {/* Aula - Solo se muestra si hay profesor seleccionado */}
          {newClass.profesor && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" error={!!errors.aula}>
                <InputLabel id="aula-label">Aula</InputLabel>
                <Select
                  labelId="aula-label"
                  value={newClass.aula?.id_aula || ''}
                  onChange={(e) => onAulaChange(e.target.value)}
                  label="Aula"
                  startAdornment={<RoomIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  disabled={loading}
                >
                  {aulas.length > 0 ? (
                    aulas.map((aula) => (
                      <MenuItem
                        key={aula.id_aula}
                        value={aula.id_aula}
                      >
                        <Box>
                          <Typography variant="body1">
                            {aula.codigo_aula}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Capacidad: {aula.capacidad} • {aula.tipo_aula}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Cargando aulas...' : 'No hay aulas disponibles'}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Seleccione el aula para la clase
                </Typography>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {/* Estado actual de la selección */}
        {(newClass.unidad || newClass.profesor || newClass.aula) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Selección Actual:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {newClass.unidad && (
                <Chip
                  icon={<SchoolIcon />}
                  label={getUnidadText(newClass.unidad)}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              )}
              {newClass.profesor && (
                <Chip
                  icon={<PersonIcon />}
                  label={getProfesorText(newClass.profesor)}
                  variant="outlined"
                  color="secondary"
                  size="small"
                />
              )}
              {newClass.aula && (
                <Chip
                  icon={<RoomIcon />}
                  label={newClass.aula.codigo_aula}
                  variant="outlined"
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Mensajes de error */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Errores en el formulario:</Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Instrucciones */}
        {!newClass.unidad && (
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