import React from 'react';
import TextField from '@mui/material/TextField';

export default function CustomImput(){
    return (
        <TextField
            fullWidth
            label="Campo"
            variant="outlined"
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#1976d2',
                    },
                    '&:hover fieldset': {
                        borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
    );
}