import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Box from "@mui/material/Box";

export function CustomSelect({
  datos,
  label = "Seleccione",
  value: valueProp,
  onChange: onChangeProp,
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(valueProp || "");

  const handleChange = (event) => {
    const newValue = event.target.value;
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
