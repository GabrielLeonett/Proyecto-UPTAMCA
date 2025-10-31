import { Box, Typography, Tooltip } from "@mui/material";
import CustomButton from "../../customButton";

// Botones de guardar y eliminar
const ActionButtons = ({ 
  onSave, 
  onDelete, 
  loading = false,
  Custom = true,
  saveDisabled = false,
  deleteDisabled = false,
  saveText = "Guardar",
  deleteText = "Eliminar",
  showSave = true,
  showDelete = true,
  saveTooltip = "Guardar cambios en el horario",
  deleteTooltip = "Eliminar horario actual",
  size = "medium"
}) => {
  if (!Custom) {
    return null;
  }

  return (
    <Box
      sx={{
        margin: "0%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "1rem",
        minWidth: "120px"
      }}
    >
      {showSave && (
        <Tooltip title={saveTooltip} arrow>
          <Box>
            <CustomButton
              variant="contained"
              onClick={onSave}
              disabled={loading || saveDisabled}
              loading={loading}
              sx={{
                borderRadius: "0px 5px 5px 0px",
                backgroundColor: loading ? "#cccccc" : "#72ff5fff",
                "&:hover": {
                  backgroundColor: loading ? "#cccccc" : "#5cd45cff",
                },
                minWidth: "100%",
                opacity: saveDisabled ? 0.6 : 1,
              }}
              size={size}
            >
              {loading ? "Guardando..." : saveText}
            </CustomButton>
          </Box>
        </Tooltip>
      )}

      {showDelete && (
        <Tooltip title={deleteTooltip} arrow>
          <Box>
            <CustomButton
              variant="contained"
              onClick={onDelete}
              disabled={loading || deleteDisabled}
              sx={{
                borderRadius: "0px 5px 5px 0px",
                backgroundColor: "#ff5454ff",
                "&:hover": {
                  backgroundColor: "#e04545ff",
                },
                minWidth: "100%",
                opacity: deleteDisabled ? 0.6 : 1,
              }}
              size={size}
            >
              {deleteText}
            </CustomButton>
          </Box>
        </Tooltip>
      )}

      {/* Estado de carga */}
      {loading && (
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: "center", 
            color: "text.secondary",
            fontStyle: "italic"
          }}
        >
          Procesando...
        </Typography>
      )}
    </Box>
  );
};

export default ActionButtons;