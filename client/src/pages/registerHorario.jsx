import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, TextField, Button, Stack, MenuItem } from '@mui/material';
import ResponsiveAppBar from "../components/navbar";
import { z } from 'zod';
import Swal from 'sweetalert2';
import axios from 'axios';

// VALIDACIÓN ZOD
const HorarioSchema = z.object({
  profesor: z.string().min(3, 'El nombre del profesor debe tener al menos 3 caracteres').nonempty('El campo Profesor no puede estar vacío'),
  trayecto: z.enum(['I', 'II', 'III', 'IV'], { errorMap: () => ({ message: 'Trayecto inválido' }) }),
  seccion: z.enum(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'], { errorMap: () => ({ message: 'Sección inválida' }) }),
  pnf: z.enum(['Informática', 'Administración', 'Prevención', 'Fisioterapia', 'Terapia Ocupacional', 'Deporte', 'Enfermería', 'Psicología'], { errorMap: () => ({ message: 'PNF inválido' }) }),
  materia: z.string().min(3, 'La materia debe tener al menos 3 caracteres').nonempty('El campo Materia no puede estar vacío'),
  dia: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], { errorMap: () => ({ message: 'Día inválido' }) }),
  hora: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora debe tener el formato HH:MM (24h)' }),
});
export default function HorarioForm (){
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(HorarioSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:3001/api/horarios', data); // <- Cambia la URL según tu backend
      Swal.fire({
        icon: 'success',
        title: 'Horario registrado',
        text: 'El horario se ha guardado correctamente'
      });
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error al registrar horario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar el horario'
      });
    }
  };

  return (
    <>
      <ResponsiveAppBar
        pages={["Universidad", "Académico", "Servicios", "Trámites"]}
        backgroundColor
      />
      <Box className="flex flex-col w-full min-h-screen bg-gray-100 p-4" sx={{ mt: 10 }}>
        <Typography component="h2" variant="h2" className="text-start mx-20 pt-8">
          Registrar Profesor En Un Horario
        </Typography>
        <Box className="flex justify-center items-start min-h-screen bg-gray-100 p-6">
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              width: '100%',
              maxWidth: 1250,
              backgroundColor: 'white',
              borderRadius: 4,
              p: 4,
              boxShadow: 3,
              mt: 3
            }}
          >
            {/* PROFESOR */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">Profesor</Typography>
              <TextField
                fullWidth
                margin="dense"
                placeholder="Nombre del profesor"
                {...register('profesor')}
                error={!!errors.profesor}
                helperText={errors.profesor?.message}
              />
            </Box>

            {/* TRAYECTO Y SECCIÓN */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Trayecto</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  select
                  defaultValue=""
                  {...register('trayecto')}
                  error={!!errors.trayecto}
                  helperText={errors.trayecto?.message}
                >
                  {['I', 'II', 'III', 'IV'].map((t) => (
                    <MenuItem key={t} value={t}>Trayecto {t}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Sección</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  select
                  defaultValue=""
                  {...register('seccion')}
                  error={!!errors.seccion}
                  helperText={errors.seccion?.message}
                >
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"].map((seccion) => (
                    <MenuItem key={seccion} value={seccion}>Sección {seccion}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* PNF Y MATERIA */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">PNF</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  select
                  defaultValue=""
                  {...register('pnf')}
                  error={!!errors.pnf}
                  helperText={errors.pnf?.message}
                >
                  {["Informática", "Administración", "Prevención", "Fisioterapia", "Terapia Ocupacional", "Deporte", "Enfermería", "Psicología"].map((pnf) => (
                    <MenuItem key={pnf} value={pnf}>{pnf}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Materia</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  placeholder="Ej: Ingeniería del Software"
                  {...register('materia')}
                  error={!!errors.materia}
                  helperText={errors.materia?.message}
                />
              </Box>
            </Box>

            {/* DÍA Y HORA */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Día</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  select
                  defaultValue=""
                  {...register('dia')}
                  error={!!errors.dia}
                  helperText={errors.dia?.message}
                >
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia) => (
                    <MenuItem key={dia} value={dia}>{dia}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Hora</Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  type="time"
                  {...register('hora')}
                  error={!!errors.hora}
                  helperText={errors.hora?.message}
                  inputProps={{ step: 300 }}
                />
              </Box>
            </Box>

            {/* BOTONES */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button variant="outlined" color="secondary" sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
                Guardar
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}