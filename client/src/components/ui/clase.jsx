import { useTheme } from "@mui/material";
import { Box, Typography } from "@mui/material";

export default function Clase({ clase }) {
  const theme = useTheme();
  return (
    <>
      <td
        key={day}
        onClick={() => toggleBlock(day, hour)}
        style={{
          cursor: "pointer",
          backgroundColor: "#fff",
          textAlign: "center",
          width: "120px",
          height: "60px",
          border: '1px solid black',
        }}
      >
        {selectedBlocks[day]?.includes(hour) ? "✔" : ""}
      </td>
    </>
  );
}
