import { Head } from "@inertiajs/react";
import { useState } from "react";
import ResponsiveAppBar from "@/components/navbar";

export default function Inicio() {
    const [darkmode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const paginas = ['Inicio', 'Universidad', 'Academia', 'Servicios', 'Tramites'];
    return (
        <div>
            <Head title="Inicio" />
            <ResponsiveAppBar pages={paginas}/>
        </div>
    );
}