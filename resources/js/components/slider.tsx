import { useState } from "react";
import ItemSlider from "./ui/itemslider";

// Define el tipo para los items del slider
interface SliderItem {
    ancho: "w-[300px]" | "w-[400px]" | "w-[500px]";
    alto: "h-[200px]" | "h-[220px]" | "h-[250px]";
    title: string;
    description: string;
    image: string;
    opacity?: `opacity-${number}`;
}

export default function Slider() {
    // Estado con datos para cada slide
    const [slides, setSlides] = useState<SliderItem[]>([
        {
            ancho: "w-[300px]",
            alto: "h-[200px]",
            title: "Informática",
            description: "Lorem ipsum dolor sit amet...",
            image: "estudiantes1.jpg",
            opacity: "opacity-50"
        },
        {
            ancho: "w-[400px]",
            alto: "h-[220px]",
            title: "Matemáticas",
            description: "Descripción de matemáticas...",
            image: "estudiantes1.jpg",
            opacity: "opacity-70"
        },
        {
            ancho: "w-[500px]",
            alto: "h-[250px]",
            title: "Matemáticas",
            description: "Descripción de matemáticas...",
            image: "estudiantes1.jpg",

        },
        {
            ancho: "w-[400px]",
            alto: "h-[220px]",
            title: "Matemáticas",
            description: "Descripción de matemáticas...",
            image: "estudiantes1.jpg",
            opacity: "opacity-70"
        },
        {
            ancho: "w-[300px]",
            alto: "h-[200px]",
            title: "Matemáticas",
            description: "Descripción de matemáticas...",
            image: "estudiantes1.jpg",
            opacity: "opacity-70"
        },
        // Más slides...
    ]);

    return (
        <div className="flex flex-row justify-around items-center m-6">
            {slides.map((slide) => (
                <ItemSlider
                    ancho={slide.ancho}
                    alto={slide.alto}
                    title={slide.title}
                    description={slide.description}
                    image={slide.image}
                    opacity={slide.opacity}
                // Podrías pasar más props aquí según necesites
                />
            ))}
        </div>
    );
}