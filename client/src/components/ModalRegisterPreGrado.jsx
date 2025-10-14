import {
    Typography,
    Box,
    Modal,
    Fade,
    Backdrop,
    MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import useApi from "../hook/useApi.jsx";
import CustomButton from "./CustomButton.jsx";
import CustomLabel from "./customLabel.jsx";
import Swal from "sweetalert2";

export default function ModalRegisterPreGrado({ open, onClose, setState }) {
    const [isLoading, setIsLoading] = useState(false);
    const { axios } = useApi();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            tipo: "",
            nombre: "",
        },
    });

    const tiposPregrado = [
        "Técnico Superior",
        "Licenciatura",
        "Ingeniería",
        "Medicina",
        "Arquitectura",
        "Derecho",
        "Educación",
        "Administración",
        "Contaduría",
        "Comunicación",
        "Psicología",
        "Enfermería",
        "Nutrición",
        "Turismo",
        "Idiomas",
    ];

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);

            const payload = {
                tipo: data.tipo,
                nombre: data.nombre,
            };

            await axios.post("/Profesor/pre-grado", payload);

            Swal.fire({
                icon: "success",
                title: "Registro exitoso",
                text: "El pregrado fue registrado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });

            // 🔄 Actualiza la lista de pregrados al cerrar
            const res = await axios.get("/Profesor/pre-grado");
            setState(res.data.data.data);

            reset();
            onClose();
        } catch (error) {
            onClose();
            console.error("Error al registrar el pregrado:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo registrar el pregrado. Intenta nuevamente.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 300 } }}
        >
            <Fade in={open}>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 3,
                        width: 480,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" textAlign="center">
                        Nuevo Pregrado
                    </Typography>

                    {/* Campo tipo */}
                    <CustomLabel
                        select
                        label="Tipo de Pregrado"
                        name="tipo"
                        required
                        fullWidth
                        {...register("tipo", { required: true })}
                    >
                        <MenuItem value="">Seleccione un tipo</MenuItem>
                        {tiposPregrado.map((tipo) => (
                            <MenuItem key={tipo} value={tipo}>
                                {tipo}
                            </MenuItem>
                        ))}
                    </CustomLabel>

                    {/* Campo nombre */}
                    <CustomLabel
                        label="Nombre del Pregrado"
                        name="nombre"
                        required
                        multiline
                        rows={2}
                        {...register("nombre", { required: true })}
                    />

                    {/* Botones */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                        <CustomButton onClick={onClose} tipo="secondary">
                            Cancelar
                        </CustomButton>
                        <CustomButton tipo="primary" disabled={isLoading} type="submit">
                            {isLoading ? "Guardando..." : "Guardar"}
                        </CustomButton>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
