

import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import Box from '@mui/material/Box';

interface DatosSelect {
    value: string;
    label: string;
}

interface CustomSelectProps {
    datos: DatosSelect[];
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    [key: string]: any; // Para otras props de MUI Select
}

export function CustomSelect({
    datos,
    label = "Seleccione",
    value: valueProp,
    onChange: onChangeProp,
    ...props
}: CustomSelectProps) {
    const [internalValue, setInternalValue] = React.useState(valueProp || '');

    const handleChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value as string;
        setInternalValue(newValue);
        onChangeProp?.(newValue);
    };

    return (
        <>
            <Box className="w-full">
                <InputLabel id="custom-select-label">{label}</InputLabel>
                <Select
                    labelId="custom-select-label"
                    value={valueProp !== undefined ? valueProp : internalValue}
                    onChange={handleChange}
                    label={label}
                    {...props}
                >

                    {datos.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                            {item.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </>
    );
}