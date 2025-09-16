export const TableOverlay = ({ isVisible }) => {
  return (
    <Fade in={isVisible}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(43, 43, 43, 0.3)",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          p: 2,
          gap: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{ display: "flex", flexDirection: "column" }}
          textAlign={"center"}
        >
          <IconButton>
            <Edit sx={{ fontSize: "7rem" }}></Edit>
          </IconButton>
          Editar
        </Typography>
        <Typography
          variant="h2"
          sx={{ display: "flex", flexDirection: "column" }}
          textAlign={"center"}
        >
          <IconButton sx={{ height: "250%" }}>
            <AdfScanner sx={{ fontSize: "7rem" }}></AdfScanner>
          </IconButton>
          Imprimir
        </Typography>
      </Box>
    </Fade>
  );
};
