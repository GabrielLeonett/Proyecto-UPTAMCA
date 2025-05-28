import React from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';

const HorarioForm = () => {
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Registrar Profesor En Un Horario
      </Typography>

      {/* Sección Profesor */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Profesor</Typography>
        <TextField
          fullWidth
          margin="normal"
          value="Kotluska Hernández"
          InputProps={{ readOnly: true }}
          sx={{ backgroundColor: '#f5f5f5' }}
        />
        <Typography variant="caption" color="textSecondary">
          Seleccione el profesor a asignar
        </Typography>
      </Box>

      {/* Sección Trayecto y Sección */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Trayecto</Typography>
          <TextField 
            fullWidth 
            margin="normal"
            select
          >
            <MenuItem value="1">Trayecto 1</MenuItem>
            <MenuItem value="2">Trayecto 2</MenuItem>
            <MenuItem value="3">Trayecto 3</MenuItem>
          </TextField>
          <Typography variant="caption" color="textSecondary">
            Seleccione el trayecto
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Sección</Typography>
          <TextField 
            fullWidth 
            margin="normal"
            select
          >
            <MenuItem value="A">Sección A</MenuItem>
            <MenuItem value="B">Sección B</MenuItem>
            <MenuItem value="C">Sección C</MenuItem>
          </TextField>
          <Typography variant="caption" color="textSecondary">
            Seleccione la sección
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderTop: '1px solid #ddd', my: 3 }} />

      {/* Sección PNF y Materia */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>PNF</Typography>
          <TextField 
            fullWidth 
            margin="normal" 
            value="Informática"
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
          <Typography variant="caption" color="textSecondary">
            Programa Nacional de Formación
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Materia</Typography>
          <TextField 
            fullWidth 
            margin="normal" 
            value="Ingeniería del Software"
            InputProps={{ readOnly: true }}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
          <Typography variant="caption" color="textSecondary">
            Materia asignada
          </Typography>
        </Box>
      </Box>

      {/* Sección Día y Hora */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Día</Typography>
          <TextField 
            fullWidth 
            margin="normal"
            select
            value="Lunes"
          >
            <MenuItem value="Lunes">Lunes</MenuItem>
            <MenuItem value="Martes">Martes</MenuItem>
            <MenuItem value="Miércoles">Miércoles</MenuItem>
          </TextField>
          <Typography variant="caption" color="textSecondary">
            Seleccione el día
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Hora</Typography>
          <TextField 
            fullWidth 
            margin="normal"
            select
            value="7:00 am"
          >
            <MenuItem value="7:00 am">7:00 am</MenuItem>
            <MenuItem value="8:30 am">8:30 am</MenuItem>
            <MenuItem value="10:00 am">10:00 am</MenuItem>
          </TextField>
          <Typography variant="caption" color="textSecondary">
            Seleccione la hora
          </Typography>
        </Box>
      </Box>

      {/* Botones */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button 
          variant="outlined" 
          color="secondary"
          sx={{ px: 4, py: 1, fontWeight: 'bold' }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ px: 4, py: 1, fontWeight: 'bold' }}
        >
          Aceptar
        </Button>
      </Stack>
    </Box>
  );
};

export default HorarioForm;