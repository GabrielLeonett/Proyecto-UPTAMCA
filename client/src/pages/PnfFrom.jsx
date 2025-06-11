import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Stack, Snackbar, Alert } from '@mui/material';
import CustomButton from '../components/customButton';
import CustomLabel from '../components/customLabel';
import ResponsiveAppBar from "../components/navbar";
import PNFSchema from '../schemas/PnfSchema';
import { registrarPnfApi } from '../apis/registrarPNFApi';

export default function PnfForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(PNFSchema), 
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registrarPnfApi({ data });
      reset();
      setSnackbar({
        open: true,
        message: 'PNF registrado exitosamente!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al registrar el PNF',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            aria-labelledby="pnf-form-title"
          >
            <Stack spacing={3}>
              <CustomLabel
                fullWidth
                label="Nombre del PNF"
                variant="outlined"
                {...register('nombre_pnf')}
                error={!!errors.nombre_pnf}
                helperText={errors.nombre_pnf?.message || 'Colocar el nombre del PNF'}
                inputProps={{ 'aria-required': 'true' }}
              />
              
              <CustomLabel
                fullWidth
                label="Código"
                variant="outlined"
                {...register('codigoPNF')}
                error={!!errors.codigoPNF}
                helperText={errors.codigoPNF?.message}
                inputProps={{ 'aria-required': 'true' }}
              />

              <CustomLabel
                fullWidth
                label="Población del PNF"
                type="number"
                variant="outlined"
                {...register('poblacionPNF', { valueAsNumber: true })}
                error={!!errors.poblacionPNF}
                helperText={errors.poblacionPNF?.message}
                inputProps={{ 'aria-required': 'true' }}
              />
              
              <CustomLabel
                fullWidth
                label="Descripción (Opcional)"
                variant="outlined"
                multiline
                rows={3}
                {...register('descripcion')}
              />
              
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <CustomButton 
                  tipo='secondary' 
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Limpiar
                </CustomButton>
                <CustomButton 
                  tipo="primary"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar PNF'}
                </CustomButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}