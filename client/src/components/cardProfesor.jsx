
import { Grid, Avatar, Typography, Box, Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "../apis/axios";

export default function CardProfesor({ profesor, onProfesorUpdate }) {
 const theme = useTheme();

 // Función para eliminar con motivo
 const handleEliminar = async () => {
     const { value: motivo } = await Swal.fire({
         title: "Eliminar Profesor",
         input: "textarea",
         inputLabel: "Motivo de la eliminación",
         inputPlaceholder: "Escribe el motivo aquí...",
         inputAttributes: {
             "aria-label": "Motivo de eliminación",
         },
         showCancelButton: true,
         confirmButtonText: "Eliminar",
         cancelButtonText: "Cancelar",
     });

     if (motivo) {
         try {
             await axios.put(`/Profesor/eliminar/${profesor.id}`, { motivo });
             Swal.fire("Eliminado", "El profesor fue eliminado correctamente", "success");
             if (onProfesorUpdate) onProfesorUpdate(); // refrescar lista
         } catch (error) {
             console.error(error);
             Swal.fire("Error", "No se pudo eliminar el profesor", "error");
         }
     }
 };

 const handleModificar = () => {
     Swal.fire("Modificar", "Aquí puedes abrir un formulario de edición.", "info");
     // Aquí deberías redirigir a la vista de edición o abrir un modal
 };

 return (
     <Grid
         container
         sx={{
             background: theme.palette.background.paper,
             padding: "30px",
             borderRadius: "25px",
         }}
         spacing={2}
     >
         {/* Avatar */}
         <Grid
             item
             xs={12}
             md={3}
             sx={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "center",
                 justifyContent: "center",
                 textAlign: "center",
             }}
         >
             <Avatar
                 src={`https://ui-avatars.com/api/?name=${profesor?.nombres || "Profesor"
                     }+${profesor?.apellidos || ""}`}
                 alt={`${profesor?.nombres} ${profesor?.apellidos}`}
                 sx={{ width: 100, height: 100, marginBottom: "8px" }}
             />
             <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.light }}>
                 {profesor?.nombres
                     ? `${profesor.nombres} ${profesor.apellidos || ""}`
                     : "No especificado"}
             </Typography>

             {/* Botones */}
             <Stack direction="row" spacing={2} mt={2}>
                 <Button variant="outlined" color="primary" onClick={handleModificar}>
                     Modificar
                 </Button>
                 <Button variant="outlined" color="error" onClick={handleEliminar}>
                     Eliminar
                 </Button>
             </Stack>
         </Grid>

         {/* Información */}
         <Grid item xs={12} md={8}>
             <Grid container spacing={3}>
                 {/* Info Personal */}
                 <Grid item xs={12} md={6}>
                     <Typography
                         variant="subtitle2"
                         gutterBottom
                         sx={{ color: theme.palette.secondary.light }}
                     >
                         Información Personal
                     </Typography>
                     <Box>
                         <Typography variant="body2">
                             <strong>Cédula de Identidad:</strong>{" "}
                             {profesor?.cedula || "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Género:</strong> {profesor?.genero || "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Fecha de Nacimiento:</strong>{" "}
                             {profesor?.fecha_nacimiento
                                 ? dayjs(profesor.fecha_nacimiento).format("DD/MM/YYYY")
                                 : "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Email:</strong> {profesor?.email || "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Telefono Celular:</strong>{" "}
                             {profesor?.telefono_movil || "No especificado"}
                         </Typography>
                     </Box>
                 </Grid>

                 {/* Sección Información Educativa y Profesional */}
                 <Grid item xs={12} md={6}>
                     <Typography
                         variant="subtitle2"
                         gutterBottom
                         sx={{ color: theme.palette.secondary.light }}
                     >
                         Información Educativa
                     </Typography>
                     <Box>
                         <Typography variant="body2"><strong>Áreas de Conocimiento:</strong> {profesor?.areas_de_conocimiento || 'No especificado'}</Typography>
                         <Typography variant="body2"><strong>Pre-Grado:</strong> {profesor?.pre_grados || 'No especificado'}</Typography>
                         <Typography variant="body2"><strong>Pos-Grado:</strong> {profesor?.pos_grados || 'No especificado'}</Typography>
                     </Box>
                 </Grid>

                 <Grid item xs={12} md={6}>
                     <Typography
                         variant="subtitle2"
                         gutterBottom
                         sx={{ color: theme.palette.secondary.light }}
                     >
                         Información Profesional
                     </Typography>
                     <Box>
                         <Typography variant="body2">
                             <strong>Fecha Ingreso:</strong>{" "}
                             {profesor?.fecha_ingreso
                                 ? dayjs(profesor.fecha_ingreso).format("DD/MM/YYYY")
                                 : "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Categoría:</strong>{" "}
                             {profesor?.categoria || "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Dedicación:</strong>{" "}
                             {profesor?.dedicacion || "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Disponibilidad:</strong>{" "}
                             {profesor?.horas_disponibles
                                 ? `${profesor?.horas_disponibles?.hours || 0} horas ${profesor?.horas_disponibles?.minutes || 0
                                 } minutos`
                                 : "No especificado"}
                         </Typography>
                         <Typography variant="body2">
                             <strong>Carga Académica:</strong>{" "}
                             {profesor?.cargaAcademica || "No especificado"}
                         </Typography>
                     </Box>
                 </Grid>
             </Grid>
         </Grid>
     </Grid>
 );
}
