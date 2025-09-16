import { useEffect, useState } from "react";
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
import Swal from "sweetalert2";
import axios from "../apis/axios";
import { Autocomplete, TextField } from "@mui/material";

export default function FormRegister() {
  const theme = useTheme();
  const {
    register,
    formState: { errors, isValid },
    control,
    handleSubmit,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(ProfesorSchema),
    defaultValues: {
      telefono_local: "",
      genero: "masculino",
      dedicacion: "Convencional",
      categoria: "Agregado",
      municipio: "",
    },
    mode: "onChange",
    shouldFocusError: true,
  });
  const [pregrados, setPregrados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [postgrados, setPostgrados] = useState([]);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [step, setStep] = useState(1); // 1 = forward, -1 = backward

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.get("/Profesor/areas-conocimiento");
      setAreas(res.data.data.data);
      res = await axios.get("/Profesor/pre-grado");
      setPregrados(res.data.data.data);
      res = await axios.get("/Profesor/post-grado");
      setPostgrados(res.data.data.data);
    };

    fetchData();
  }, []);

  // Observa todos los campos del formulario
  const onSubmit = async (data) => {
    try {
      await registrarProfesorApi(data);
      Swal.fire({
        icon: "success",
        title: "Profesor registrado",
        text: "El profesor se guardó exitosamente en la base de datos.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Hubo un problema en el servidor",
      });
    }
  };

  // Función para manejar el "Siguiente"
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      // Solo validamos los campos obligatorios
      isValid = await trigger([
        "nombres",
        "apellidos",
        "email",
        "cedula",
        "genero",
        "fecha_nacimiento",
      ]);
    } else if (step === 2) {
      isValid = await trigger([
        "area_de_conocimiento",
        "pre_grado",
        "pos_grado", // si también quieres validar posgrado
      ]);
    }

    if (isValid) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  return (
    <>
      <ResponsiveAppBar backgroundColor />
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
                        label="Dirección de habitacion"
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
                        id="municipio"
                        name="municipio"
                        label="Municipio"
                        variant="outlined"
                        {...register("municipio", { required: true })}
                        error={!!errors.municipio}
                        helperText={errors.municipio?.message || "Seleccione su municipio"}
                        value={watch("municipio") || ""} // 👈 asegura que no sea undefined
                      >
                        <MenuItem value="">Seleccione</MenuItem>
                        <MenuItem value="Guaicaipuro">Guaicaipuro</MenuItem>
                        <MenuItem value="Los Salias">Los Salias</MenuItem>
                        <MenuItem value="Carrizal">Carrizal</MenuItem>
                      </CustomLabel>

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

                    <Box className="grid grid-cols-1 gap-8 w-full px-10 py-6">
                      <Controller
                        name="area_de_conocimiento"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <>
                            <CustomLabel
                              select
                              label="Área de Conocimiento"
                              fullWidth
                              onChange={async (e) => {
                                const value = e.target.value;
                                if (value === "Otro") {
                                  const { value: text } = await Swal.fire({
                                    title: "Agregar otra área",
                                    input: "text",
                                    inputLabel: "Especifique el área",
                                  });
                                  if (text)
                                    field.onChange([...field.value, text]);
                                } else if (
                                  value &&
                                  !field.value.includes(value)
                                ) {
                                  field.onChange([...field.value, value]);
                                }
                              }}
                              value=""
                            >
                              <MenuItem value="">Seleccione un área</MenuItem>
                              {areas.map((a) => (
                                <MenuItem
                                  key={a.id_area_conocimiento}
                                  value={a.nombre_area_conocimiento}
                                >
                                  {a.nombre_area_conocimiento}
                                </MenuItem>
                              ))}
                              <MenuItem value="Otro">Otro</MenuItem>
                            </CustomLabel>
                            <DeletableChips
                              values={field.value}
                              onChange={field.onChange}
                            />
                          </>
                        )}
                      />
                      {/* ================= PREGRADO ================= */}
                      <Controller
                        name="pre_grado"
                        control={control}
                        defaultValue={[]}
                        helperText={
                          errors.pre_grado?.message ||
                          "Selecciona en la lista el pregrado"
                        }
                        render={({ field }) => (
                          <Autocomplete
                            multiple
                            options={[
                              ...pregrados.map((pg) => ({
                                id_pre_grado: pg.id_pre_grado,
                                nombre_pre_grado: pg.nombre_pre_grado,
                                tipo_pre_grado: pg.tipo_pre_grado,
                              })),
                              {
                                id_pre_grado: "otro",
                                nombre_pre_grado: "Otro",
                                tipo_pre_grado: "Otros",
                              },
                            ]}
                            groupBy={(option) => option.tipo_pre_grado}
                            getOptionLabel={(option) => option.nombre_pre_grado}
                            filterSelectedOptions
                            value={field.value}
                            onChange={async (_, newValue) => {
                              // ¿Seleccionó "Otro"?
                              if (
                                newValue.some(
                                  (opt) => opt.nombre_pre_grado === "Otro"
                                )
                              ) {
                                const { value: text } = await Swal.fire({
                                  title: "Agregar otro pregrado",
                                  input: "text",
                                  inputLabel: "Especifique el pregrado",
                                  inputPlaceholder: "Escribe aquí...",
                                  showCancelButton: true,
                                  inputValidator: (val) => {
                                    if (!val)
                                      return "Por favor ingrese un valor";
                                    if (
                                      field.value.some(
                                        (v) => v.nombre_pre_grado === val
                                      )
                                    )
                                      return "Este pregrado ya está agregado";
                                    return null;
                                  },
                                });

                                if (text) {
                                  field.onChange([
                                    ...newValue.filter(
                                      (v) => v.nombre_pre_grado !== "Otro"
                                    ),
                                    {
                                      id_pre_grado: `custom-${Date.now()}`, // 👈 para diferenciar
                                      nombre_pre_grado: text,
                                      tipo_pre_grado: "Otros",
                                    },
                                  ]);
                                }
                              } else {
                                field.onChange(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Pregrado"
                                variant="outlined"
                                error={!!errors.pre_grado}
                                helperText={errors.pre_grado?.message}
                              />
                            )}
                          />
                        )}
                      />

                      {/* ================= POSGRADO ================= */}
                      <Controller
                        name="pos_grado"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <Autocomplete
                            multiple
                            options={[
                              ...postgrados.map((pg) => ({
                                id_pos_grado: pg.id_pos_grado,
                                nombre_pos_grado: pg.nombre_pos_grado,
                                tipo_pos_grado: pg.tipo_pos_grado,
                              })),
                              {
                                id_pos_grado: "otro",
                                nombre_pos_grado: "Otro",
                                tipo_pos_grado: "Otros",
                              },
                            ]}
                            groupBy={(option) => option.tipo_pos_grado}
                            getOptionLabel={(option) => option.nombre_pos_grado}
                            filterSelectedOptions
                            value={field.value}
                            onChange={async (_, newValue) => {
                              // Si el usuario selecciona "Otro"
                              if (
                                newValue.some(
                                  (opt) => opt.nombre_pos_grado === "Otro"
                                )
                              ) {
                                const { value: text } = await Swal.fire({
                                  title: "Agregar otro posgrado",
                                  input: "text",
                                  inputLabel: "Especifique el posgrado",
                                  inputPlaceholder: "Escribe aquí...",
                                  showCancelButton: true,
                                  inputValidator: (val) => {
                                    if (!val)
                                      return "Por favor ingrese un valor";
                                    if (
                                      field.value.some(
                                        (v) => v.nombre_pos_grado === val
                                      )
                                    )
                                      return "Este posgrado ya está agregado";
                                    return null;
                                  },
                                });

                                if (text) {
                                  field.onChange([
                                    ...newValue.filter(
                                      (v) => v.nombre_pos_grado !== "Otro"
                                    ),
                                    {
                                      id_pos_grado: `custom-${Date.now()}`, // 👈 identificador temporal
                                      nombre_pos_grado: text,
                                      tipo_pos_grado: "Otros",
                                    },
                                  ]);
                                }
                              } else {
                                field.onChange(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Posgrado"
                                variant="outlined"
                                error={!!errors.pos_grado}
                                helperText={errors.pos_grado?.message}
                              />
                            )}
                          />
                        )}
                      />
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
                        onClick={() =>
                          console.log(
                            "Botón clickeado, isValid:",
                            isValid,
                            "Errores:",
                            errors
                          )
                        }
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
