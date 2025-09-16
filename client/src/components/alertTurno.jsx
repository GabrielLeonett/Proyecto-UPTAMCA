import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "../apis/axios";

export default function AlertTurno({ idSeccion, isOpen, onClose }) {
    const [selected, setSelected] = useState();
    const theme = useTheme();

    const handleSelect = async (turnoId, turnoNombre) => {
        setSelected(turnoNombre)

        try {
            const response = await axios.post(
                'Secciones/asignar-turno',
                {
                    idSeccion: idSeccion,
                    idTurno: turnoId
                }

            );

            console.log('Turno asignado correctamente:', response.data);
            onClose();
        } catch (error) {
            console.error('Error al asignar el turno:', error);
            alert('Ocurrió un error al asignar el turno.');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Selecciona el turno</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    Elige el turno correspondiente para esta sección:
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", gap: 2, px: 3, pb: 2 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignContent: 'center',
                    gap: 4
                }}>
                    <Button
                        variant="contained"
                        sx={{ minWidth: '400px', minHeight: '80px', fontSize: '28px', backgroundColor: 'gray' }}
                        onClick={() => handleSelect(1, "Matutino")}
                    >
                        Matutino
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ minWidth: '400px', minHeight: '80px', fontSize: '28px', backgroundColor: 'gray' }}
                        onClick={() => handleSelect(2, "Vespertino")}
                    >
                        Vespertino
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ minWidth: '400px', minHeight: '80px', fontSize: '28px', backgroundColor: 'gray' }}
                        onClick={() => handleSelect(3, "Nocturno")}
                    >
                        Nocturno
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
