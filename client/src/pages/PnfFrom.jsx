import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { z } from 'zod';
import Swal from 'sweetalert2';
import axios from 'axios';
import ResponsiveAppBar from "../components/navbar";

// Esquema de validación
const PnfSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').nonempty('Campo obligatorio'),
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres').nonempty('Campo obligatorio'),
  descripcion: z.string().optional()
});

export default function PnfForm({ onPnfAdded }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(PnfSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:3001/api/pnfs', data);
      Swal.fire({
        icon: 'success',
        title: 'PNF registrado',
        text: 'El PNF se ha guardado correctamente'
      });
      reset();
      if (onPnfAdded) onPnfAdded(response.data);
    } catch (error) {
      console.error('Error al registrar PNF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un problema al guardar el PNF'
      });
    }
  };

  return (
    <>
      <ResponsiveAppBar
        pages={["Universidad", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />
      <Box 
        sx={{
          display: 'flex',
          minHeight: 'calc(100vh - 5px)',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{ 
          maxWidth: 800, 
          width: '100%',
          mx: 'auto', 
          p: 4, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          boxShadow: 3,
        }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Registrar Nuevo PNF
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nombre del PNF"
                variant="outlined"
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Código"
                variant="outlined"
                {...register('codigo')}
                error={!!errors.codigo}
                helperText={errors.codigo?.message}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Descripción (Opcional)"
                variant="outlined"
                multiline
                rows={3}
                {...register('descripcion')}
                InputLabelProps={{ shrink: true }}
              />
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" color="secondary" onClick={() => reset()}>
                  Limpiar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Guardar PNF
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}