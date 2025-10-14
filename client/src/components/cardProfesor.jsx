import {
  Grid,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import { ProfesorSchema } from "../schemas/ProfesorSchema.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react"; // ✅ Agregar useRef
import useApi from "../hook/useApi";

export default function CardProfesor({ profesor }) {
  const axios = useApi();
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // ✅ Agregar useRef para controlar si ya se hizo la petición
  const hasFetched = useRef(false);

  // Cargar la imagen del profesor
  useEffect(() => {
    // ✅ Prevenir múltiples ejecuciones
    if (hasFetched.current || !profesor?.cedula) {
      return;
    }

    const loadProfessorImage = async () => {
      try {
        console.log("🔄 Iniciando carga de imagen para:", profesor.cedula);
        
        setImageLoading(true);
        setImageError(false);
        hasFetched.current = true; // ✅ Marcar como ya ejecutado

        const response = await axios.get(
          `http://localhost:3000/profesor/img/${profesor.cedula}`,
          {
            responseType: "blob",
          }
        );

        console.log("✅ Respuesta recibida:", {
          status: response.status,
          dataSize: response.data.size,
        });

        if (response.status === 200 && response.data.size > 0) {
          const imageUrl = URL.createObjectURL(response.data);
          console.log("📷 URL creada:", imageUrl);
          setAvatarUrl(imageUrl);
        } else {
          console.log("❌ Respuesta vacía o inválida");
          setImageError(true);
        }
      } catch (error) {
        console.error("❌ Error cargando imagen del profesor:", {
          message: error.message,
          status: error.response?.status,
        });
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadProfessorImage();
  }, [profesor?.cedula, axios]); // ✅ Dependencias mínimas

  // Limpiar la URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  // ✅ Resetear el flag cuando cambia el profesor
  useEffect(() => {
    hasFetched.current = false;
    setAvatarUrl(null);
    setImageError(false);
    setImageLoading(true);
  }, [profesor?.cedula]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
  });

  // URL de fallback para el avatar
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${
    profesor?.nombres || "Profesor"
  }+${profesor?.apellidos || ""}&background=random&size=256`;

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        padding: "30px",
        borderRadius: "25px",
        alignItems: "flex-start",
        width: { xs: "100%", sm: 500, md: 600 },
        minWidth: 300,
        maxWidth: 500,
        margin: "0 auto",
      }}
      spacing={3}
    >
      {/* Sección de imagen con gradiente */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Avatar
            variant="square"
            src={imageError || !avatarUrl ? fallbackAvatarUrl : avatarUrl}
            alt={`${profesor?.nombres} ${profesor?.apellidos}`}
            sx={{
              width: "100%",
              height: 500,
              minHeight: 200,
              backgroundColor: theme.palette.grey[300],
              transition: "all 0.3s ease",
              filter: imageLoading ? "blur(5px)" : "none",
            }}
            onError={() => {
              console.log("🖼️ Error cargando imagen, usando fallback");
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => {
              console.log("🖼️ Imagen cargada exitosamente");
              setImageLoading(false);
            }}
          />

          {/* Overlay de carga */}
          {imageLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cargando imagen...
              </Typography>
            </Box>
          )}

          {/* Gradiente overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            }}
          />

          {/* Texto sobre la imagen */}
          <Typography
            variant="h3"
            sx={{
              position: "absolute",
              left: 20,
              bottom: 20,
              color: "white",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              zIndex: 1,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {profesor?.nombres?.split(" ")[0] || "No"}{" "}
            {profesor?.apellidos?.split(" ")[0] || "Especificado"}
          </Typography>
        </Box>
      </Grid>

      {/* Resto del componente... */}
    </Box>
  );
}import {
  Grid,
  Avatar,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import { ProfesorSchema } from "../schemas/ProfesorSchema.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react"; // ✅ Agregar useRef
import useApi from "../hook/useApi";

export default function CardProfesor({ profesor }) {
  const axios = useApi();
  const theme = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // ✅ Agregar useRef para controlar si ya se hizo la petición
  const hasFetched = useRef(false);

  // Cargar la imagen del profesor
  useEffect(() => {
    // ✅ Prevenir múltiples ejecuciones
    if (hasFetched.current || !profesor?.cedula) {
      return;
    }

    const loadProfessorImage = async () => {
      try {
        console.log("🔄 Iniciando carga de imagen para:", profesor.cedula);
        
        setImageLoading(true);
        setImageError(false);
        hasFetched.current = true; // ✅ Marcar como ya ejecutado

        const response = await axios.get(
          `http://localhost:3000/profesor/img/${profesor.cedula}`,
          {
            responseType: "blob",
          }
        );

        console.log("✅ Respuesta recibida:", {
          status: response.status,
          dataSize: response.data.size,
        });

        if (response.status === 200 && response.data.size > 0) {
          const imageUrl = URL.createObjectURL(response.data);
          console.log("📷 URL creada:", imageUrl);
          setAvatarUrl(imageUrl);
        } else {
          console.log("❌ Respuesta vacía o inválida");
          setImageError(true);
        }
      } catch (error) {
        console.error("❌ Error cargando imagen del profesor:", {
          message: error.message,
          status: error.response?.status,
        });
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadProfessorImage();
  }, [profesor?.cedula, axios]); // ✅ Dependencias mínimas

  // Limpiar la URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  // ✅ Resetear el flag cuando cambia el profesor
  useEffect(() => {
    hasFetched.current = false;
    setAvatarUrl(null);
    setImageError(false);
    setImageLoading(true);
  }, [profesor?.cedula]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
  });

  // URL de fallback para el avatar
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${
    profesor?.nombres || "Profesor"
  }+${profesor?.apellidos || ""}&background=random&size=256`;

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        padding: "30px",
        borderRadius: "25px",
        alignItems: "flex-start",
        width: { xs: "100%", sm: 500, md: 600 },
        minWidth: 300,
        maxWidth: 500,
        margin: "0 auto",
      }}
      spacing={3}
    >
      {/* Sección de imagen con gradiente */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Avatar
            variant="square"
            src={imageError || !avatarUrl ? fallbackAvatarUrl : avatarUrl}
            alt={`${profesor?.nombres} ${profesor?.apellidos}`}
            sx={{
              width: "100%",
              height: 500,
              minHeight: 200,
              backgroundColor: theme.palette.grey[300],
              transition: "all 0.3s ease",
              filter: imageLoading ? "blur(5px)" : "none",
            }}
            onError={() => {
              console.log("🖼️ Error cargando imagen, usando fallback");
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => {
              console.log("🖼️ Imagen cargada exitosamente");
              setImageLoading(false);
            }}
          />

          {/* Overlay de carga */}
          {imageLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cargando imagen...
              </Typography>
            </Box>
          )}

          {/* Gradiente overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            }}
          />

          {/* Texto sobre la imagen */}
          <Typography
            variant="h3"
            sx={{
              position: "absolute",
              left: 20,
              bottom: 20,
              color: "white",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              zIndex: 1,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {profesor?.nombres?.split(" ")[0] || "No"}{" "}
            {profesor?.apellidos?.split(" ")[0] || "Especificado"}
          </Typography>
        </Box>
      </Grid>

      {/* Resto del componente... */}
    </Box>
  );
}