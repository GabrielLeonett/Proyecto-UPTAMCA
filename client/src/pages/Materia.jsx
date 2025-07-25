import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, TextField, Button, Stack, Grid, Paper, MenuItem } from '@mui/material';
import { z } from 'zod';
import Swal from 'sweetalert2';
import axios from 'axios';
import ResponsiveAppBar from "../components/navbar";

// Esquema de validación
const MateriaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').nonempty('Campo obligatorio'),
  codigo: z.string().min(5, 'El código debe tener al menos 5 caracteres').nonempty('Campo obligatorio'),
  pnfId: z.string().nonempty('Debe seleccionar un PNF'),
  trayecto: z.enum(['I', 'II', 'III', 'IV'], { errorMap: () => ({ message: 'Trayecto inválido' }) }),
  horas: z.number().min(1, 'Las horas deben ser mayor a 0'),
  descripcion: z.string().optional()
});

export default function MateriaForm({ onMateriaAdded }) {
  const [pnfs, setPnfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(MateriaSchema)
  });

  // Obtener PNFs al cargar el componente
  useEffect(() => {
    const fetchPnfs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/pnfs');
        setPnfs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener PNFs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los PNFs'
        });
        setLoading(false);
      }
    };
    fetchPnfs();
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:3001/api/materias', data);
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'La materia se ha registrado correctamente',
        confirmButtonColor: '#1976d2'
      });
      reset();
      if (onMateriaAdded) onMateriaAdded(response.data);
    } catch (error) {
      console.error('Error al registrar materia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Hubo un problema al guardar la materia',
        confirmButtonColor: '#d32f2f'
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
          minHeight: 'calc(100vh - 64px)',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: '900px',
            p: 4,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: { xs: '1.8rem', sm: '2rem' }
            }}
          >
            Registrar Nueva Unidad Curricular
          </Typography>

          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={3}>
              {/* Nombre de la Materia */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre de la Materia"
                  variant="outlined"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: '#fff' }}
                />
              </Grid>

              {/* Código */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código"
                  variant="outlined"
                  {...register('codigo')}
                  error={!!errors.codigo}
                  helperText={errors.codigo?.message}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: '#fff' }}
                />
              </Grid>

              {/* PNF */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="PNF"
                  variant="outlined"
                  {...register('pnfId')}
                  error={!!errors.pnfId}
                  helperText={errors.pnfId?.message}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {loading ? (
                    <MenuItem value="">Cargando PNFs...</MenuItem>
                  ) : (
                    pnfs.map((pnf) => (
                      <MenuItem key={pnf._id} value={pnf._id}>
                        {pnf.nombre}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              {/* Trayecto */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Trayecto"
                  variant="outlined"
                  {...register('trayecto')}
                  error={!!errors.trayecto}
                  helperText={errors.trayecto?.message}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {['I', 'II', 'III', 'IV'].map((t) => (
                    <MenuItem key={t} value={t}>Trayecto {t}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Horas Académicas */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horas Académicas"
                  variant="outlined"
                  type="number"
                  {...register('horas', { valueAsNumber: true })}
                  error={!!errors.horas}
                  helperText={errors.horas?.message}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: '#fff' }}
                />
              </Grid>

              {/* Descripción */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción (Opcional)"
                  variant="outlined"
                  multiline
                  rows={4}
                  {...register('descripcion')}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: '#fff' }}
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Stack 
                  direction="row" 
                  spacing={2} 
                  justifyContent="flex-end"
                  sx={{ mt: 2 }}
                >
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => reset()}
                    sx={{ px: 4, py: 1 }}
                  >
                    Limpiar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{ px: 4, py: 1 }}
                  >
                    Guardar Materia
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </>
  );
}