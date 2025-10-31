import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Stack,
  IconButton,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  SwapHoriz as MoveIcon
} from '@mui/icons-material';

// Mensajes de estado (selección, movimiento, etc.)
const StatusMessages = ({ 
  selectedClass, 
  classToMove, 
  onCancelMovement,
  availableSlotsCount = 0,
  onClearSelection
}) => {
  const theme = useTheme();

  const getClassName = (clase) => {
    if (!clase) return 'Clase no disponible';
    return clase.nombreUnidadCurricular || clase.nombre_unidad_curricular || 'Clase sin nombre';
  };

  const getProfessorName = (clase) => {
    if (!clase) return 'Profesor no asignado';
    if (clase.nombreProfesor && clase.apellidoProfesor) {
      return `${clase.nombreProfesor} ${clase.apellidoProfesor}`;
    }
    return clase.nombre_profesor || 'Profesor no asignado';
  };

  const getHorasClase = (clase) => {
    if (!clase) return null;
    return clase.horasClase || clase.horas_clase;
  };

  // Solo renderizar si hay clases seleccionadas
  const hasSelectedClass = selectedClass && Object.keys(selectedClass).length > 0;
  const hasClassToMove = classToMove && Object.keys(classToMove).length > 0;

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {/* Mensaje de clase seleccionada */}
      <Collapse in={hasSelectedClass && !hasClassToMove}>
        {hasSelectedClass && (
          <Alert
            icon={<CheckCircleIcon fontSize="small" />}
            severity="success"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClearSelection}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.dark,
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Clase Seleccionada
                </Typography>
                <Chip 
                  label="Lista para programar" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {getClassName(selectedClass)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profesor: {getProfessorName(selectedClass)}
                  </Typography>
                </Box>
                
                {getHorasClase(selectedClass) && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={`${getHorasClase(selectedClass)} horas`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon fontSize="inherit" />
                {availableSlotsCount > 0 
                  ? `Haz click en cualquiera de los ${availableSlotsCount} slots verdes disponibles para programar la clase`
                  : 'Buscando horarios disponibles...'
                }
              </Typography>
            </Box>
          </Alert>
        )}
      </Collapse>

      {/* Mensaje de movimiento de clase */}
      <Collapse in={hasClassToMove}>
        {hasClassToMove && (
          <Alert
            icon={<MoveIcon fontSize="small" />}
            severity="warning"
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={onCancelMovement}
                startIcon={<CloseIcon />}
                sx={{ 
                  borderColor: theme.palette.warning.main,
                  color: theme.palette.warning.dark,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    borderColor: theme.palette.warning.dark,
                  }
                }}
              >
                Cancelar
              </Button>
            }
            sx={{
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.dark,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Moviendo Clase
                </Typography>
                <Chip 
                  label="En proceso" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {getClassName(classToMove)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profesor: {getProfessorName(classToMove)}
                  </Typography>
                </Box>
                
                {getHorasClase(classToMove) && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={`${getHorasClase(classToMove)} horas`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningIcon fontSize="inherit" />
                {availableSlotsCount > 0 
                  ? `Selecciona uno de los ${availableSlotsCount} horarios disponibles (resaltados en verde)`
                  : 'Calculando horarios disponibles...'
                }
              </Typography>
            </Box>
          </Alert>
        )}
      </Collapse>

      {/* Mensaje de slots disponibles */}
      {availableSlotsCount > 0 && (hasSelectedClass || hasClassToMove) && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            py: 1
          }}
        >
          <Typography variant="caption">
            <strong>{availableSlotsCount} slots disponibles</strong> encontrados. 
            Haz click en cualquier celda verde para {hasClassToMove ? 'mover' : 'asignar'} la clase.
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};

export default StatusMessages;