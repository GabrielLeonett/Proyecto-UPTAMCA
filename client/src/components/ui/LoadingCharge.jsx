import { Box } from "@mui/material";
import LogoSimple from "./LogoSimple";
export default function LoadingCharge(charge) {
    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                zIndex: 9999,
            }}
        >
            <LogoSimple animacion={charge} ></LogoSimple>
        </Box>);
}