import ResponsiveAppBar from '@/components/navbar';
import { Head } from '@inertiajs/react';
import Typography from '@mui/material/Typography';

export default function Index() {
    return (
        <>
            <Head title="Inicio" />
            <ResponsiveAppBar pages={['Universidad','Academico','Servicios','Tramites']} />
            <section className="relative flex h-[48rem] items-center justify-end">
                {/* Fondo con imagen y gradiente */}
                <div className="absolute inset-0 bg-cover bg-center h-<100%>" style={{ backgroundImage: "linear-gradient(to bottom, hsla(0, 0.00%, 19.20%, 0.60), rgba(0, 0, 0, 0.81)), url('/storage/estudiantes1.jpg')", }} aria-hidden="true"></div>
                <div className="relative max-w-2xl rounded-lg p-8 text-center text-white">
                    <Typography component="h1" variant="h3" gutterBottom>
                        «Enséñese lo que se entienda, enséñese lo que sea útil, enséñese a todos; y eso es todo.»
                    </Typography>
                    <Typography component="h2" variant="h4">
                        Cecilio Acosta
                    </Typography>
                </div>
            </section>
            <Typography variant='h2' component={'h2'}>
                Noticias
            </Typography>
            <hr />
            
        </>
    );
}
