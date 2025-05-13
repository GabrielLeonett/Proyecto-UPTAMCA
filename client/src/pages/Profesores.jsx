import ResponsiveAppBar from '../components/navbar';
import { Typography } from '@mui/material';

export default function Profesores() {
    return (
        <>
            <ResponsiveAppBar
                pages={["Universidad", "Académico", "Servicios", "Trámites"]}
                backgroundColor
            />
            <div className="px-4 py-40">
                <Typography component="h3" variant="h2" >Profesores</Typography>
                <Typography component="p" variant='p'>Bienvenido a la página de profesores.</Typography>
                {/* Aquí puedes agregar más contenido relacionado con los profesores */}
            </div>
        </>
    );
};

