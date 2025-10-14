import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CustomCalendar from "../../components/customCalendar";
import { Controller, useForm } from "react-hook-form";
import CustomLabel from "../components/customLabel";
import CustomButton from "../components/customButton";
import ResponsiveAppBar from "../../components/navbar";
import MenuItem from "@mui/material/MenuItem";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfesorSchema } from "../../schemas/ProfesorSchema";
import dayjs from "dayjs";
import DeletableChips from "../../components/ui/customChip";
import { Autocomplete, TextField } from "@mui/material";
<<<<<<< HEAD
import axios from "../apis/axios";
import ModalRegisterAreaConocimiento from "../components/modalRegisterAreaConocimiento";
import ModalRegisterPreGrado from "../components/ModalRegisterPreGrado";
import ModalRegisterPosGrado from "../components/ModalRegisterPosGrado";
=======
import useApi from "../../hook/useApi"; // Added import for axios
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a

export default function FormRegister() {
  const axios = useApi();
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
      municipio: "Guaicaipuro",
      area_de_conocimiento: [],
      pre_grado: [],
      pos_grado: [],
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const [pregrados, setPregrados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [postgrados, setPostgrados] = useState([]);
  const [direction, setDirection] = useState(1);
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Agregamos los estados independientes para cada modal
  const [openModalArea, setOpenModalArea] = useState(false);
  const [openModalPregrado, setOpenModalPregrado] = useState(false);
  const [openModalPosgrado, setOpenModalPosgrado] = useState(false);


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, pregradoRes, postgradoRes] = await Promise.all([
          axios.get("/Profesor/areas-conocimiento"),
          axios.get("/Profesor/pre-grado"),
          axios.get("/Profesor/post-grado"),
        ]);

        setAreas(areasRes.data);
        setPregrados(pregradoRes.data);
        setPostgrados(postgradoRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // 👉 Maneja la actualización de la lista cuando se registra una nueva área
  const actualizarAreas = async () => {
    try {
      const res = await axios.get("/Profesor/areas-conocimiento");
      setAreas(res.data.data.data);
    } catch (error) {
      console.error("Error al actualizar áreas:", error);
    }
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setSelectedImage(file); // ← Guardar el archivo en estado

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const dataToSend = new FormData();

      // 1. Agregar campos básicos
      const camposBasicos = [
        "nombres",
        "apellidos",
        "email",
        "cedula",
        "genero",
        "fecha_nacimiento",
        "telefono_movil",
        "telefono_local",
        "direccion",
        "municipio",
        "categoria",
        "dedicacion",
        "fecha_ingreso",
      ];

      camposBasicos.forEach((campo) => {
        if (
          formData[campo] !== null &&
          formData[campo] !== undefined &&
          formData[campo] !== ""
        ) {
          dataToSend.append(campo, formData[campo]);
        }
      });

      // 2. 🔥 CORRECCIÓN: Enviar arrays como JSON stringificado
      if (
        formData.area_de_conocimiento &&
        formData.area_de_conocimiento.length > 0
      ) {
        dataToSend.append(
          "area_de_conocimiento",
          JSON.stringify(formData.area_de_conocimiento)
        );
      }

      if (formData.pre_grado && formData.pre_grado.length > 0) {
        dataToSend.append("pre_grado", JSON.stringify(formData.pre_grado));
      }

      if (formData.pos_grado && formData.pos_grado.length > 0) {
        dataToSend.append("pos_grado", JSON.stringify(formData.pos_grado));
      }

      // 3. Imagen
      if (selectedImage) {
        dataToSend.append("imagen", selectedImage);
      }

      await axios.post("/Profesor/register", dataToSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation functions
  const handleNext = async () => {
    const fieldSets = {
      1: [
        "nombres",
        "apellidos",
        "email",
        "cedula",
        "genero",
        "fecha_nacimiento",
      ],
      2: ["area_de_conocimiento", "pre_grado", "pos_grado"],
      3: ["categoria", "fecha_ingreso", "dedicacion"],
    };
    const isValid = await trigger(fieldSets[step] || []);
    if (isValid) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  // Step components
  const Step1PersonalData = () => (
    <>
      <Typography component="h3" variant="h3" className="self-start">
        Datos Personales
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-10 py-6">
        <CustomLabel
          id="nombres"
          label="Nombres"
          type="text"
          variant="outlined"
          {...register("nombres")}
          error={!!errors.nombres}
          helperText={
            errors.nombres?.message || "Ingrese sus nombres completos"
          }
        />

        <CustomLabel
          id="apellidos"
          label="Apellidos"
          type="text"
          variant="outlined"
          {...register("apellidos")}
          error={!!errors.apellidos}
          helperText={
            errors.apellidos?.message || "Ingrese sus apellidos completos"
          }
        />

        <CustomLabel
          id="email"
          label="Email"
          type="email"
          variant="outlined"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message || "Ejemplo: usuario@dominio.com"}
        />

        <CustomLabel
          id="cedula"
          name="cedula"
          label="Cédula"
          type="text"
          variant="outlined"
          {...register("cedula", {
            setValueAs: (value) => {
              if (value === "" || value === undefined) return "";

              const numericValue = value.toString().replace(/\D/g, "");
              if (numericValue === "") return "";

              const num = parseInt(numericValue, 10);
              return isNaN(num) ? "" : num;
            },
          })}
          error={!!errors.cedula}
          helperText={
            errors.cedula?.message || "Solo números, sin guiones ni puntos"
          }
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 8,
          }}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            e.target.value = value;
          }}
        />

        <CustomLabel
          id="telefono_movil"
          label="Teléfono Móvil"
          type="tel"
          variant="outlined"
          {...register("telefono_movil")}
          error={!!errors.telefono_movil}
          helperText={errors.telefono_movil?.message || "Ejemplo: 04121234567"}
        />

        <CustomLabel
          id="telefono_local"
          label="Teléfono Local"
          type="tel"
          variant="outlined"
          {...register("telefono_local")}
          error={!!errors.telefono_local}
          helperText={
            errors.telefono_local?.message || "Opcional - Ejemplo: 02121234567"
          }
        />

        <CustomLabel
          id="direccion"
          label="Dirección de habitación"
          type="text"
          variant="outlined"
          {...register("direccion")}
          error={!!errors.direccion}
          helperText={
            errors.direccion?.message || "Dirección completa de residencia"
          }
        />

        <CustomLabel
          select
          id="municipio"
          label="Municipio"
          variant="outlined"
          {...register("municipio", { required: true })}
          error={!!errors.municipio}
          helperText={errors.municipio?.message || "Seleccione su municipio"}
          value={watch("municipio") || ""}
        >
          <MenuItem value="">Seleccione</MenuItem>
          <MenuItem value="Guaicaipuro">Guaicaipuro</MenuItem>
          <MenuItem value="Los Salias">Los Salias</MenuItem>
          <MenuItem value="Carrizal">Carrizal</MenuItem>
        </CustomLabel>

        <CustomLabel
          select
          label="Género"
          {...register("genero", { required: true })}
          error={!!errors.genero}
          helperText={errors.genero?.message || "Seleccione su género"}
          value={watch("genero") || "masculino"}
        >
          <MenuItem value="masculino">Masculino</MenuItem>
          <MenuItem value="femenino">Femenino</MenuItem>
        </CustomLabel>

        <Controller
          name="fecha_nacimiento"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <CustomCalendar
              label="Fecha de Nacimiento"
              value={field.value ? dayjs(field.value, "DD-MM-YYYY") : null}
              onChange={(date) => field.onChange(date?.format("DD-MM-YYYY"))}
              maxDate={dayjs().subtract(18, "year")} // ⭐ Máxima fecha: hoy - 18 años
              slotProps={{
                textField: {
                  helperText:
                    error?.message || "Selecciona tu fecha de nacimiento",
                  error: !!error,
                },
              }}
            />
          )}
        />
      </Box>
    </>
  );

  const Step2EducationalInfo = () => (
    <>
      <Typography component="h3" variant="h3" className="self-start">
        Información Educativa
      </Typography>

      <Box className="grid grid-cols-1 gap-8 w-full px-10 py-6">
        {/* Área de Conocimiento */}
        <Controller
          name="area_de_conocimiento"
          control={control}
          render={({ field }) => (
            <>
              <CustomLabel
                select
                label="Área de Conocimiento"
                fullWidth
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "Otro") {
<<<<<<< HEAD
                    setOpenModalArea(true);
=======
                    const { value: text } = await Swal.fire({
                      title: "Agregar otra área",
                      input: "text",
                      inputLabel: "Especifique el área",
                    });

                    if (text) {
                      try {
                        const response = await axios.post(
                          "http://localhost:3000/Profesor/areas-conocimiento",
                          {
                            area_conocimiento: text,
                          }
                        );

                        if (response.data) {
                          field.onChange([...field.value, text]);

                          // Actualizar la lista de áreas
                          axios
                            .get("/Profesor/areas-conocimiento")
                            .then((res) => {
                              setAreas(res);
                            });

                          Swal.fire(
                            "Éxito",
                            "Área agregada correctamente",
                            "success"
                          );
                        }
                      } catch (error) {
                        console.error("Error al agregar área:", error);
                        Swal.fire(
                          "Error",
                          "No se pudo agregar el área",
                          "error"
                        );
                      }
                    }
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a
                  } else if (value && !field.value.includes(value)) {
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

              <DeletableChips values={field.value} onChange={field.onChange} />
            </>
          )}
        />

        {/* Modal Área */}
        <ModalRegisterAreaConocimiento
          open={openModalArea}
          onClose={() => setOpenModalArea(false)}
          setState={setAreas}
        />

        {/* Pregrado */}
        <Controller
          name="pre_grado"
          control={control}
          render={({ field }) => (
<<<<<<< HEAD
            <>
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
                value={field.value || []}
                onChange={(_, newValue) => {
                  const uniqueValues = newValue.filter(
                    (item, index, self) =>
                      index === self.findIndex((t) => t.id_pre_grado === item.id_pre_grado)
                  );

                  if (uniqueValues.some((opt) => opt.nombre_pre_grado === "Otro")) {
                    setOpenModalPregrado(true);

=======
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
              getOptionLabel={(option) =>
                `${option.tipo_pre_grado} - ${option.nombre_pre_grado}`
              }
              filterSelectedOptions
              value={field.value || []}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id_pre_grado}
                    label={`${option.tipo_pre_grado} ${option.nombre_pre_grado.toLowerCase()}`}
                    size="small"
                  />
                ))
              }
              onChange={async (_, newValue) => {
                const uniqueValues = newValue.filter(
                  (item, index, self) =>
                    index ===
                    self.findIndex((t) => t.id_pre_grado === item.id_pre_grado)
                );

                // Si seleccionó "Otro"
                if (
                  uniqueValues.some((opt) => opt.nombre_pre_grado === "Otro")
                ) {
                  const { value: text } = await Swal.fire({
                    title: "Agregar otro pregrado",
                    input: "text",
                    inputLabel: "Especifique el pregrado",
                    inputPlaceholder: "Escribe aquí...",
                    showCancelButton: true,
                    inputValidator: (val) => {
                      if (!val) return "Por favor ingrese un valor";
                      if (field.value?.some((v) => v.nombre_pre_grado === val))
                        return "Este pregrado ya existe";
                      return null;
                    },
                  });

                  if (text) {
                    try {
                      const response = await axios.post(
                        "http://localhost:3000/Profesor/pre-grado",
                        {
                          nombre_pre_grado: text,
                          tipo_pre_grado: "Otros",
                        }
                      );

                      if (response.data) {
                        const filteredValues = uniqueValues.filter(
                          (v) => v.nombre_pre_grado !== "Otro"
                        );

                        const newPregrado = {
                          id_pre_grado:
                            response.data.id_pre_grado ||
                            `custom-${Date.now()}`,
                          nombre_pre_grado: text,
                          tipo_pre_grado: "Otros",
                        };

                        field.onChange([...filteredValues, newPregrado]);

                        axios.get("/Profesor/pre-grado").then((res) => {
                          setPregrados(res || res.data.data);
                        });

                        Swal.fire(
                          "Éxito",
                          "Pregrado agregado correctamente",
                          "success"
                        );
                      }
                    } catch (error) {
                      console.error("Error al agregar pregrado:", error);
                      Swal.fire(
                        "Error",
                        "No se pudo agregar el pregrado",
                        "error"
                      );

                      const filteredValues = uniqueValues.filter(
                        (v) => v.nombre_pre_grado !== "Otro"
                      );
                      field.onChange(filteredValues);
                    }
                  } else {
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a
                    const filteredValues = uniqueValues.filter(
                      (v) => v.nombre_pre_grado !== "Otro"
                    );
                    field.onChange(filteredValues);
                  } else {
                    field.onChange(uniqueValues);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pregrado"
                    variant="outlined"
                    error={!!errors.pre_grado}
                    helperText={errors.pre_grado?.message || "Seleccione al menos un pregrado"}
                  />
                )}
              />

              <ModalRegisterPreGrado
                open={openModalPregrado}
                onClose={() => setOpenModalPregrado(false)}
                setState={setPregrados}
              />
            </>
          )}
        />

        {/* Posgrado */}
        <Controller
          name="pos_grado"
          control={control}
          render={({ field }) => (
            <>
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
                value={field.value || []}
                onChange={async (_, newValue) => {
                  const uniqueValues = newValue.filter(
                    (item, index, self) =>
                      index === self.findIndex((t) => t.id_pos_grado === item.id_pos_grado)
                  );

<<<<<<< HEAD
                  if (uniqueValues.some((opt) => opt.nombre_pos_grado === "Otro")) {
                    setOpenModalPosgrado(true);

=======
                // Si seleccionó "Otro"
                if (
                  uniqueValues.some((opt) => opt.nombre_pos_grado === "Otro")
                ) {
                  const { value: text } = await Swal.fire({
                    title: "Agregar otro posgrado",
                    input: "text",
                    inputLabel: "Especifique el posgrado",
                    inputPlaceholder: "Escribe aquí...",
                    showCancelButton: true,
                    inputValidator: (val) => {
                      if (!val) return "Por favor ingrese un valor";
                      if (field.value?.some((v) => v.nombre_pos_grado === val))
                        return "Este posgrado ya existe";
                      return null;
                    },
                  });

                  if (text) {
                    try {
                      // Petición POST para agregar nuevo posgrado
                      const response = await axios.post(
                        "http://localhost:3000/Profesor/pos-grado",
                        {
                          nombre_pos_grado: text,
                          tipo_pos_grado: "Otros",
                        }
                      );

                      if (response.data) {
                        // Filtrar "Otro" y agregar el nuevo valor
                        const filteredValues = uniqueValues.filter(
                          (v) => v.nombre_pos_grado !== "Otro"
                        );

                        const newPosgrado = {
                          id_pos_grado:
                            response.data.id_pos_grado ||
                            `custom-${Date.now()}`,
                          nombre_pos_grado: text,
                          tipo_pos_grado: "Otros",
                        };

                        field.onChange([...filteredValues, newPosgrado]);

                        // Actualizar la lista de posgrados
                        axios.get("/Profesor/pos-grado").then((res) => {
                          setPostgrados(res || res.data.data);
                        });

                        Swal.fire(
                          "Éxito",
                          "Posgrado agregado correctamente",
                          "success"
                        );
                      }
                    } catch (error) {
                      console.error("Error al agregar posgrado:", error);
                      Swal.fire(
                        "Error",
                        "No se pudo agregar el posgrado",
                        "error"
                      );

                      // Si hay error, mantener valores sin "Otro"
                      const filteredValues = uniqueValues.filter(
                        (v) => v.nombre_pos_grado !== "Otro"
                      );
                      field.onChange(filteredValues);
                    }
                  } else {
                    // Si canceló, mantener valores sin "Otro"
>>>>>>> 2e8f5b1f3dacd27e5fdf3c985cc39a066946472a
                    const filteredValues = uniqueValues.filter(
                      (v) => v.nombre_pos_grado !== "Otro"
                    );
                    field.onChange(filteredValues);
                  } else {
                    field.onChange(uniqueValues);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Posgrado"
                    variant="outlined"
                    error={!!errors.pos_grado}
                    helperText={errors.pos_grado?.message || "Opcional"}
                  />
                )}
              />

              <ModalRegisterPosGrado
                open={openModalPosgrado}
                onClose={() => setOpenModalPosgrado(false)}
                setState={setPostgrados}
              />
            </>
          )}
        />

      </Box>
    </>
  );

  const Step3ProfessionalInfo = () => (
    <>
      <Typography component="h3" variant="h3" className="self-start mb-6">
        Información Profesional
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-10 py-4">
        <CustomLabel
          select
          id="categoria"
          label="Categoría"
          variant="outlined"
          {...register("categoria")}
          error={!!errors.categoria}
          helperText={errors.categoria?.message}
          fullWidth
          value={watch("categoria") || ""}
        >
          <MenuItem value="Instructor">Instructor</MenuItem>
          <MenuItem value="Asistente">Asistente</MenuItem>
          <MenuItem value="Asociado">Asociado</MenuItem>
          <MenuItem value="Agregado">Agregado</MenuItem>
          <MenuItem value="Titular">Titular</MenuItem>
        </CustomLabel>

        <Controller
          name="fecha_ingreso"
          control={control}
          render={({ field }) => (
            <CustomCalendar
              value={field.value ? dayjs(field.value, "DD-MM-YYYY") : null}
              onChange={(date) => field.onChange(date?.format("DD-MM-YYYY"))}
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

        <CustomLabel
          select
          id="dedicacion"
          label="Dedicación"
          variant="outlined"
          {...register("dedicacion")}
          error={!!errors.dedicacion}
          helperText={errors.dedicacion?.message}
          fullWidth
          value={watch("dedicacion") || ""}
        >
          <MenuItem value="Convencional">Convencional</MenuItem>
          <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
          <MenuItem value="Tiempo Completo">Tiempo Completo</MenuItem>
          <MenuItem value="Exclusivo">Exclusivo</MenuItem>
        </CustomLabel>
      </Box>
    </>
  );

  const Step4ImageUpload = () => (
    <>
      <Typography component="h3" variant="h3" className="self-start mb-6">
        Imagen del Profesor
      </Typography>

      <Box className="flex flex-col items-center space-y-6">
        <Box className="relative">
          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </>
          ) : (
            <Box className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-dashed border-gray-300">
              <Typography variant="body2" color="textSecondary">
                Sin imagen
              </Typography>
            </Box>
          )}
        </Box>

        <input
          type="file"
          id="imagen"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />

        <label htmlFor="imagen">
          <CustomButton
            type="button"
            variant="outlined"
            component="span"
            className="h-10"
          >
            {selectedImage ? "Cambiar Imagen" : "Seleccionar Imagen"}
          </CustomButton>
        </label>

        <Typography variant="caption" color="textSecondary" align="center">
          Formatos: JPEG, PNG, WebP. Tamaño máximo: 5MB
        </Typography>

        {/* ✅ Mostrar error de validación */}
        {errors.imagen && (
          <Typography variant="caption" color="error">
            {errors.imagen.message}
          </Typography>
        )}
      </Box>
    </>
  );

  // Render steps based on current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1PersonalData />;
      case 2:
        return <Step2EducationalInfo />;
      case 3:
        return <Step3ProfessionalInfo />;
      case 4:
        return <Step4ImageUpload />;
      default:
        return <Step1PersonalData />;
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
            encType="multipart/form-data"
            sx={{
              backgroundColor: theme.palette.background.paper,
              width: "80%",
              padding: "50px",
              borderRadius: "25px",
              boxShadow: theme.shadows[10],
              minHeight: "450px",
              position: "relative",
            }}
          >
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.div
                key={step}
                layout
                initial={{ opacity: 0, x: 50 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 * direction }}
                transition={{ type: "tween", duration: 0.3 }}
              >
                {renderStep()}

                {/* Navigation Buttons */}
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
                        onClick={handlePrevious}
                      >
                        Anterior
                      </CustomButton>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step < 4 ? (
                      <CustomButton
                        type="button"
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="primary"
                        onClick={handleNext} // ✅ Corregido
                      >
                        Siguiente
                      </CustomButton>
                    ) : (
                      <CustomButton
                        type="submit"
                        variant="contained"
                        className="h-12 w-32 rounded-xl font-medium"
                        tipo="primary"
                        disabled={isSubmitting || !isValid}
                      >
                        {isSubmitting ? "Registrando..." : "Registrar"}
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
