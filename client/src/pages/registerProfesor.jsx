import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CustomCalendar from "../components/customCalendar";
import { Controller, useForm } from "react-hook-form";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import ResponsiveAppBar from "../components/navbar";
import MenuItem from "@mui/material/MenuItem";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfesorSchema } from "../schemas/ProfesorSchema";
import dayjs from "dayjs";
import { registrarProfesorApi } from "../apis/registrarProfesorApi";
import DeletableChips from "../components/ui/customChip";

export default function FormRegister() {
  const theme = useTheme();
  const {
    register,
    formState: { errors, isValid },
    control,
    setValue,
    handleSubmit,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
    defaultValues: {
      genero: "masculino",
      dedicacion: "Convencional",
      ubicacion: "Núcleo de Tecnología y Ciencias Administrativas",
      categoria: "Agregado",
    },
    mode: "onBlur",
    shouldFocusError: true,
  });

  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [step, setStep] = useState(1); // 1 = forward, -1 = backward

  // Configuración de animaciones
  const stepVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      position: "absolute",
    }),
    center: {
      opacity: 1,
      x: 0,
      position: "relative",
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      position: "absolute",
    }),
  };
  const pages = [
    { name: "Inicio", url: "/" },
    {
      name: "Profesor",
      submenu: [
        { name: "Ver", url: "/Profesores" },
        { name: "Registrar", url: "/registerProfesor" },
      ],
    },
    {
      name: "PNF",
      submenu: [
        { name: "Ver", url: "/PNF" },
        { name: "Registrar", url: "/registerPNF" },
      ],
    },
    { name: "Contacto", url: "/contact" },
  ];

  const transition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };


  // Observa todos los campos del formulario

  const onSubmit = async (data) => {
    await registrarProfesorApi({ data });
  };

  // Función para manejar el "Siguiente"
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger([
        "nombres",
        "apellidos",
        "email",
        "cedula",
        "telefono_movil",
        "genero",
        "fecha_nacimiento",
      ]);
    } else if (step === 2) {
      isValid = await trigger(["area_de_conocimiento", "pre_grado"]);
    }

    if (isValid) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  // Modifica el botón Siguiente:
  <CustomButton
    type="button"
    variant="contained"
    className="h-12 w-32 rounded-xl font-medium"
    tipo="primary"
    onClick={handleNext} // Usa la nueva función
  >
    Siguiente
  </CustomButton>;
  return (
    <>
      <ResponsiveAppBar pages={pages} backgroundColor />

      <Box
        className="flex flex-col w-full min-h-screen bg-gray-100 p-4"
        sx={{
          mt: 10,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "screen",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ mt: 6, ml: 6 }}
        >
          Registrar Profesor
        </Typography>

        <Box className="flex justify-center items-center flex-grow p-3">
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              width: "80%",
              padding: "50px",
              borderRadius: "25px",
              boxShadow: theme.shadows[10],
              minHeight: "450px", // 👈 Evita los colapsos bruscos
              position: "relative", // 👈 Necesario para `position: absolute` interno
            }}
          >
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.div
                key={step}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "tween", duration: 0.3 }}
              >
                {/* Paso 1: Datos Personales */}
                {step === 1 && (
                  <>
                    <Typography
                      component={"h3"}
                      variant="h3"
                      className="self-start"
                    >
                      {" "}
                      Datos Personales{" "}
                    </Typography>

                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6">
                      <CustomLabel
                        id="nombres"
                        name="nombres"
                        label="Nombres"
                        type="text"
                        variant="outlined"
                        {...register("nombres")}
                        error={!!errors.nombres}
                        helperText={
                          errors.nombres?.message ||
                          "Ingrese sus nombres completos"
                        }
                      />

                      <CustomLabel
                        id="apellidos"
                        name="apellidos"
                        label="Apellidos"
                        type="text"
                        variant="outlined"
                        {...register("apellidos")}
                        error={!!errors.apellidos}
                        helperText={
                          errors.apellidos?.message ||
                          "Ingrese sus apellidos completos"
                        }
                      />

                      <CustomLabel
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        variant="outlined"
                        {...register("email")}
                        error={!!errors.email}
                        helperText={
                          errors.email?.message ||
                          "Ejemplo: usuario@dominio.com"
                        }
                      />

                      <CustomLabel
                        id="cedula"
                        name="cedula"
                        label="Cédula"
                        type="text"
                        variant="outlined"
                        {...register("cedula", { valueAsNumber: true })}
                        error={!!errors.cedula}
                        helperText={
                          errors.cedula?.message ||
                          "Solo números, sin guiones ni puntos"
                        }
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                      />

                      <CustomLabel
                        id="telefono_movil"
                        name="telefono_movil"
                        label="Teléfono Móvil"
                        type="tel"
                        variant="outlined"
                        {...register("telefono_movil")}
                        error={!!errors.telefono_movil}
                        helperText={
                          errors.telefono_movil?.message ||
                          "Ejemplo: 04121234567"
                        }
                      />

                      <CustomLabel
                        id="telefono_local"
                        name="telefono_local"
                        label="Teléfono Local"
                        type="tel"
                        variant="outlined"
                        {...register("telefono_local")}
                        error={!!errors.telefono_local}
                        helperText={
                          errors.telefono_local?.message ||
                          "Opcional - Ejemplo: 02121234567"
                        }
                      />

                      <CustomLabel
                        id="direccion"
                        name="direccion"
                        label="Dirección"
                        type="text"
                        variant="outlined"
                        {...register("direccion")}
                        error={!!errors.direccion}
                        helperText={
                          errors.direccion?.message ||
                          "Dirección completa de residencia"
                        }
                      />
                      <CustomLabel
                        select
                        name="genero"
                        label="Género"
                        {...register("genero", { required: true })}
                        error={!!errors.genero}
                        helperText={
                          errors.genero?.message || "Seleccione su género"
                        }
                        value={watch("genero") || "masculino"} // Valor por defecto seguro
                      >
                        <MenuItem value="masculino">Masculino</MenuItem>
                        <MenuItem value="femenino">Femenino</MenuItem>
                      </CustomLabel>

                      <Controller
                        name="fecha_nacimiento"
                        control={control}
                        defaultValue={null}
                        render={({ field }) => (
                          <CustomCalendar
                            value={
                              field.value
                                ? dayjs(field.value, "DD-MM-YYYY")
                                : null
                            }
                            onChange={(date) => {
                              field.onChange(date?.format("DD-MM-YYYY"));
                            }}
                            slotProps={{
                              textField: {
                                helperText:
                                  errors.fecha_nacimiento?.message ||
                                  "Selecciona una fecha válida",
                                error: !!errors.fecha_nacimiento,
                                variant: "outlined",
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </>
                )}
                {/* Paso 2: Información Educativa */}
                {step === 2 && (
                  <>
                    <Typography
                      component={"h3"}
                      variant="h3"
                      className="self-start"
                    >
                      Información Educativa
                    </Typography>

                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6">
                     <Controller
  name="area_de_conocimiento"
  control={control}
  defaultValue={[]}
  render={({ field }) => (
    <>
      <DeletableChips values={field.value} onChange={field.onChange} />
      {errors.area_de_conocimiento && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errors.area_de_conocimiento.message}
        </Typography>
      )}

      {field.value.includes("Otro") && (
        <CustomLabel
          id="area_de_conocimiento_otro"
          name="area_de_conocimiento_otro"
          label="Especifique el área de conocimiento"
          type="text"
          variant="outlined"
          {...register("area_de_conocimiento_otro")}
          error={!!errors.area_de_conocimiento_otro}
          helperText={errors.area_de_conocimiento_otro?.message}
          sx={{ mt: 2 }}
        />
      )}
    </>
  )}
/>

{/* Opcional: Si el array incluye "Otro", mostrar input para especificar */}
{watch("area_de_conocimiento")?.includes("Otro") && (
  <CustomLabel
    id="area_de_conocimiento_otro"
    name="area_de_conocimiento_otro"
    label="Especifique el área de conocimiento"
    type="text"
    variant="outlined"
    {...register("area_de_conocimiento_otro")}
    error={!!errors.area_de_conocimiento_otro}
    helperText={errors.area_de_conocimiento_otro?.message}
  />
)}
                      <CustomLabel
                        select
                        id="pre_grado"
                        name="pre_grado"
                        label="Pregrado"
                        variant="outlined"
                        {...register("pre_grado")}
                        error={!!errors.pre_grado}
                        helperText={errors.pre_grado?.message || "Título obtenido en pregrado"}
                        fullWidth
                        value={watch("pre_grado") || ""}
                      >
                        <MenuItem value="">Seleccione un pregrado</MenuItem>
                        <MenuItem value="Informatica">Ingeniería en Informática</MenuItem>
                        <MenuItem value="Sistemas">Ingeniería en Sistemas</MenuItem>
                        <MenuItem value="Psicologia">Psicología</MenuItem>
                        <MenuItem value="Enfermeria">Enfermería</MenuItem>
                        <MenuItem value="Administracion">Administración</MenuItem>
                        <MenuItem value="Fisioterapia">Fisioterapia</MenuItem>
                        <MenuItem value="Deporte">Deporte</MenuItem>
                        <MenuItem value="Prevencion">Prevención y Riesgos</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>2
                      </CustomLabel>
                      {watch("pre_grado") === "Otro" && (
                        <CustomLabel
                          id="pre_grado_otro"
                          name="pre_grado_otro"
                          label="Especifique otro pregrado"
                          type="text"
                          variant="outlined"
                          {...register("pre_grado_otro", {
                            required: "Debe especificar el pregrado"
                          })}
                          error={!!errors.pre_grado_otro}
                          helperText={errors.pre_grado_otro?.message}
                          fullWidth
                        />
                      )}


                      <CustomLabel
                        select
                        id="pos_grado"
                        name="pos_grado"
                        label="Posgrado"
                        variant="outlined"
                        {...register("pos_grado")}
                        error={!!errors.pos_grado}
                        helperText={
                          errors.pos_grado?.message || "Seleccione un posgrado (opcional)"
                        }
                        fullWidth
                        value={watch("pos_grado") || ""}
                      >
                        <MenuItem value="">Sin posgrado</MenuItem>
                        <MenuItem value="Especialización">Especialización</MenuItem>
                        <MenuItem value="Maestría">Maestría</MenuItem>
                        <MenuItem value="Doctorado">Doctorado</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>
                      </CustomLabel>

                      {/* Si elige "Otro", permitir escribir el nombre */}
                      {watch("pos_grado") === "Otro" && (
                        <CustomLabel
                          id="pos_grado_otro"
                          name="pos_grado_otro"
                          label="Especifique el posgrado"
                          type="text"
                          variant="outlined"
                          {...register("pos_grado_otro")}
                          error={!!errors.pos_grado_otro}
                          helperText={errors.pos_grado_otro?.message}
                        />
                      )}
                    </Box>
                  </>
                )}
                {/* Paso 3: Información Profesional */}
                {step === 3 && (
                  <>
                    <Typography
                      component={"h3"}
                      variant="h3"
                      className="self-start mb-6 text-xl font-bold"
                    >
                      Información Profesional
                    </Typography>
                    <Box sx={{ width: "100%" }}>
                      {/* Fila 1 - 2 columnas en desktop */}
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-10 py-4">
                        {/* Columna 1 - Categoría */}
                        <CustomLabel
                          select
                          id="categoria"
                          name="categoria"
                          label="Categoría"
                          variant="outlined"
                          {...register("categoria")}
                          error={!!errors.categoria}
                          helperText={errors.categoria?.message}
                          fullWidth
                          value={watch("categoria") || ""} // Maneja el caso undefined
                        >
                          <MenuItem value="Instructor">Instructor</MenuItem>
                          <MenuItem value="Asistente">Asistente</MenuItem>
                          <MenuItem value="Asociado">Asociado</MenuItem>
                          <MenuItem value="Agregado">Agregado</MenuItem>
                          <MenuItem value="Titular">Titular</MenuItem>
                        </CustomLabel>

                        {/* Columna 2 - Fecha Ingreso */}
                        <Controller
                          name="fecha_ingreso"
                          control={control}
                          defaultValue={null}
                          render={({ field }) => (
                            <CustomCalendar
                              value={
                                field.value
                                  ? dayjs(field.value, "DD-MM-YYYY")
                                  : null
                              }
                              onChange={(date) => {
                                field.onChange(date?.format("DD-MM-YYYY"));
                              }}
                              slotProps={{
                                textField: {
                                  helperText:
                                    errors.fecha_ingreso?.message ||
                                    "Selecciona una fecha válida",
                                  error: !!errors.fecha_ingreso,
                                  variant: "outlined",
                                },
                              }}
                            />
                          )}
                        />
                      </Box>

                      {/* Fila 2 - 2 columnas en desktop */}
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-10 py-4">
                        {/* Columna 1 - Dedicación */}
                        <CustomLabel
                          select
                          id="dedicacion"
                          name="dedicacion"
                          label="Dedicacion"
                          variant="outlined"
                          {...register("dedicacion")}
                          error={!!errors.dedicacion}
                          helperText={errors.dedicacion?.message}
                          fullWidth
                          value={watch("dedicacion") || ""} // Maneja el caso undefined
                        >
                          <MenuItem value="Convencional">Convencional</MenuItem>
                          <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
                          <MenuItem value="Tiempo Completo">
                            Tiempo Completo
                          </MenuItem>
                          <MenuItem value="Exclusivo">Exclusivo</MenuItem>
                        </CustomLabel>

                        {/* Columna 2 - Ubicación */}
                        <CustomLabel
                          select
                          id="ubicacion"
                          name="ubicacion"
                          label="Ubicación"
                          variant="outlined"
                          {...register("ubicacion")}
                          error={!!errors.ubicacion}
                          helperText={errors.ubicacion?.message}
                          fullWidth
                          value={watch("ubicacion") || ""} // Maneja el caso undefined
                        >
                          <MenuItem value="">Seleccione una ubicación</MenuItem>
                          <MenuItem value="Núcleo de Tecnología y Ciencias Administrativas">
                            Núcleo de Tecnología y Ciencias Administrativas
                          </MenuItem>
                          <MenuItem value="Núcleo de Salud y Deporte">
                            Núcleo de Salud y Deporte
                          </MenuItem>
                          <MenuItem value="Núcleo de Humanidades y Ciencias Sociales">
                            Núcleo de Humanidades y Ciencias Sociales
                          </MenuItem>
                        </CustomLabel>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Botones de navegación */}
                <Box className="flex justify-between w-full mt-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step === 1 ? (
                      <CustomButton
                        type="button"
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="secondary"
                      >
                        Cancelar
                      </CustomButton>
                    ) : (
                      <CustomButton
                        type="button"
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="secondary"
                        onClick={() => {
                          setDirection(-1);
                          setStep((prev) => prev - 1);
                        }}
                      >
                        Anterior
                      </CustomButton>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step < 3 ? (
                      <CustomButton
                        type="button"
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="primary"
                        onClick={handleNext}
                      >
                        Siguiente
                      </CustomButton>
                    ) : (
                      <CustomButton
                        type="submit" // ¡Asegúrate de que sea type="submit"!
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="primary"
                        disabled={!isValid}
                      >
                        Registrar
                      </CustomButton>
                    )}
                  </motion.div>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </>
  );
}
