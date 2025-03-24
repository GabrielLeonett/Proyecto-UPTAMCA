import { useState } from 'react';
import ResponsiveAppBar from '@/components/navbar';
import { Head } from '@inertiajs/react';
import Typography from '@mui/material/Typography';
import Slider from '@/components/slider';
import { useScrollDetection } from '@/hook/useScrollDetection';

export default function Index() {
    const [scrolled, setScrolled] = useState(false);
    
    useScrollDetection(() => {
        setScrolled(true);
    }, 200); 

    return (
        <>
            <Head title="Inicio" />
            <ResponsiveAppBar 
                pages={['Universidad', 'Academico', 'Servicios', 'Tramites']}  
                backgroundColor={scrolled} 
            />
            
            <section className="relative flex h-[48rem] items-center justify-end">
                <div 
                    className="absolute inset-0 bg-cover bg-center h-full"
                    style={{ 
                        backgroundImage: "linear-gradient(to bottom, hsla(0, 0%, 19.2%, 0.6), rgba(60, 59, 59, 0.81)), url('/storage/estudiantes1.jpg')" 
                    }} 
                    aria-hidden="true"
                />
                
                <div className="relative max-w-2xl rounded-lg p-8 text-center text-white">
                    <Typography component="h1" variant="h3" gutterBottom>
                        «Enséñese lo que se entienda, enséñese lo que sea útil, enséñese a todos; y eso es todo.»
                    </Typography>
                    <Typography component="h2" variant="h4">
                        Cecilio Acosta
                    </Typography>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8">
                <Typography variant="h2" component="h2" gutterBottom>
                    Programas Nacionales de Formación
                </Typography>
                <hr className="my-4" />
                <Slider />
            </div>
        </>
    );
}