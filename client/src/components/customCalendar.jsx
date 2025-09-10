import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

const CustomCalendar = ({
  label = "Seleccionar fecha",
  disabled = false,
  readOnly = false,
  ...props
}) => {
  const theme = useTheme();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <DatePicker
        maxDate={dayjs()} // No permite fechas futuras
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e0e0e0", // Normal
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2", // Hover
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2", // Focus
              borderWidth: "2px",
            },
          },

          "& .MuiInputLabel-root": {
            color: theme.palette.text.secondary,
            "&.Mui-focused": {
              color: theme.palette.text.primary,
            },
          },
          "& .MuiSvgIcon-root": {
            color: theme.palette.primary.main,
            "&:hover": {
              color: theme.palette.primary.dark,
            },
          },

          "& .MuiPickersDay-root": {
            "&:hover": {
              backgroundColor: theme.palette.primary.light,
            },
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
          "& .MuiIconButton-root": {
            color: theme.palette.primary.main,
          },
          "& .MuiPickersInputBase-root": {
            border: "1px solid",
            borderColor: theme.palette.primary.main,
            "&:focus-within": {
              border: "none",
            },
          },
        }}
        label={label}
        format="DD/MM/YYYY"
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
    </LocalizationProvider>
  );
};

CustomCalendar.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(dayjs),
  ]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default CustomCalendar;
