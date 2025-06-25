import * as React from "react";
import { ToggleButton, Box } from "@mui/material";
import {useTheme} from "@mui/material/styles";

export default function CustomToggleButtons({ options, value, onChange }) {
  const [selectedValue, setSelectedValue] = React.useState(value || null);
  const theme = useTheme();

  const handleSelection = (event, newValue) => {
    if (newValue !== null) {
      newValue === selectedValue ? setSelectedValue('') : setSelectedValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          aria-label={option.label}
          disabled={option.disabled}
          selected={selectedValue === option.value}
          onChange={handleSelection}
          sx={{
            minWidth: 10,
            fontSize: theme.typography.button,
            transition: 'all 0.5s ease',
              "&:hover": {
                fontSize: theme.typography.button,
                backgroundColor: theme.palette.primary.light,
              },
            "&.Mui-selected": {
              fontSize: theme.typography.button,
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transition: 'all 0.5s ease',
              "&:hover": {
                fontSize: theme.typography.button,
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </Box>
  );
}
