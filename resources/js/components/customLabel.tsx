import { TextField } from "@mui/material";

export default function CustomLabel({ ...props }) {
    return (
        <TextField
            sx={{
                '& .MuiInputLabel-root': { // Estilo para la etiqueta
                    borderRadius: '15px',
                    fontSize: '16px',
                    color: 'black', // Color de la etiqueta
                },
                '& .MuiInputLabel-shrink': { // Estilo para la etiqueta cuando el campo está enfocado o tiene valor
                    borderRadius: '15px',
                    color: 'black', // Color del texto cuando está enfocado
                },
                '& .MuiOutlinedInput-root': { // Estilo para el campo de entrada
                    '& fieldset': {
                        borderColor: '#53A6E5', // Color del borde del campo
                        borderRadius: '15px',
                        color: 'black', // Color del texto cuando está enfocado
                    },
                    '&:hover fieldset': {
                        borderColor: '#0d47a1', // Color del borde al pasar el mouse
                        borderRadius: '15px',
                        color: 'black', // Color del texto cuando está enfocado
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#0d47a1', // Color del borde cuando está enfocado
                        borderRadius: '15px',
                        color: 'black', // Color del texto cuando está enfocado
                    },
                }
            }}
        {...props}
        />
    )
}