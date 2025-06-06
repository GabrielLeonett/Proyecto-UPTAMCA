import { Head } from "@inertiajs/react";
import { useState } from "react";
import ResponsiveAppBar from "@/components/navbar";


export default function Index() {
    const [darkmode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const paginas = ['Inicio', 'Profesores', 'Horarios', 'PNFs'];
    return (
        <div>
            <Head title="Inicio" />
            <ResponsiveAppBar pages={paginas}/>
        </div>
    );
}