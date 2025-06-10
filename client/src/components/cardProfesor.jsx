import { Grid, Avatar, Typography, Box } from "@mui/material";
import {useTheme} from '@mui/material/styles'
import dayjs from 'dayjs';

export default function CardProfesor({ profesor }) {
    const theme = useTheme();
  return (
    <Grid container
        sx={{background: theme.palette.background.paper,
            padding: '30px',
            borderRadius: '25px'
         }}
         spacing={2}
    >
      {/* Sección Avatar */}
        <Grid size={3} sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'}}>
            <Avatar 
                src={`https://ui-avatars.com/api/?name=${profesor?.nombres || 'Profesor'}+${profesor?.apellidos || ''}`}
                alt={`${profesor?.nombres} ${profesor?.apellidos}`}
                sx={{ 
                width: 100, 
                height: 100,
                marginBottom: '8px'
                }}
            />
            <Typography variant="subtitle1" sx={{color: theme.palette.secondary.light}}>
                {profesor?.nombres ? `${profesor.nombres} ${profesor.apellidos || ''}` : 'No especificado'}
            </Typography>
        </Grid>

      {/* Sección Información */}
      <Grid size={8} >
          {/* Información Personal */}
          <Grid container spacing={3}>
            <Grid size={6}>
              <Typography variant="subtitle2" gutterBottom sx={{color: theme.palette.secondary.light}}>Información Personal</Typography>
              <Box>
                <Typography variant="body2"><strong>Cédula de Identidad:</strong> {profesor?.cedula || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Género:</strong> {profesor?.genero || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Fecha de Nacimiento:</strong> {profesor?.fecha_nacimiento ? dayjs(profesor.fecha_nacimiento).format('DD/MM/YYYY') : 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {profesor?.email || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Telefono Celular:</strong> {profesor?.telefono_movil || 'No especificado'}</Typography>
              </Box>
                <br />
              <Typography variant="subtitle2" gutterBottom sx={{color: theme.palette.secondary.light}}>Información Educativa</Typography>
              <Box>
                <Typography variant="body2"><strong>Áreas de Conocimiento:</strong> {profesor?.area_de_conocimiento|| 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Pre-Grado:</strong> {profesor?.pre_grado || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Post-Grado:</strong> {profesor?.post_grado || 'No especificado'}</Typography>
              </Box>
            </Grid>

            {/* Información Profesional */}
            <Grid size={6}>
              <Typography variant="subtitle2" gutterBottom sx={{color: theme.palette.secondary.light}}>Información Profesional</Typography>
              <Box>
                <Typography variant="body2"><strong>Fecha Ingreso:</strong> {profesor?.fecha_ingreso ? dayjs(profesor.fecha_ingreso).format('DD/MM/YYYY') : 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Categoría:</strong> {profesor?.categoria || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Dedicación:</strong> {profesor?.dedicacion || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Ubicación:</strong> {profesor?.ubicacion || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Disponibilidad:</strong> {profesor?.disponibilidad || 'No especificado'}</Typography>
                <Typography variant="body2"><strong>Carga Académica:</strong> {profesor?.cargaAcademica || 'No especificado'}</Typography>
              </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}