import {Clase} from "./ui/clase";
import { Box, Typography } from "@mui/material";
export default function Horario () {
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid
        container
        sx={{
          '--Grid-borderWidth': '1px',
          borderTop: 'var(--Grid-borderWidth) solid',
          borderLeft: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
          '& > div': {
            borderRight: 'var(--Grid-borderWidth) solid',
            borderBottom: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
          },
        }}
      >
        {[...Array(10)].map((_, index) => (
          <Grid
            key={index}
            minHeight={160}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
          <Clase profesor={`Profesor `} unidad_curricular={`Unidad Curricular`}>     
            </Clase>
        </Grid>
        ))}
      </Grid>
    </Box>
}