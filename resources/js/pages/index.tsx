import { Head } from "@inertiajs/react";
import ResponsiveAppBar from "@/components/navbar";
import { useState } from "react";

export default function Index() {
    const [darkmode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div>
            <Head title="Inicio" />
            <ResponsiveAppBar/>
            
            
        </div>
    );
}