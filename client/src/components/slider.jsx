import ItemSlider from "./ui/itemslider";

export default function Slider() {
    // Estado con datos para cada slide
    const slides  = [
        {
            title: "Informática",
            description: "Lorem ipsum dolor sit amet...",
            image: "estudiantes1.jpg",
            opacity: "opacity-30",
            positionX:0,
            zIndex: "z-0"
        },{
            title: "Administración",
            description: "Lorem ipsum dolor sit amet...",
            image: "estudiantes1.jpg",
            opacity: "opacity-100",
            positionX:400,
            zIndex: "z-10"
        },{
            title: "fisioterapia",
            description: "Lorem ipsum dolor sit amet...",
            image: "estudiantes1.jpg",
            opacity: "opacity-30",
            positionX:1000,
            zIndex: "z-0"
        }
    ];

    return (
        <div className="relative h-96 overflow-hidden"> {/* Añadido altura y overflow-hidden */}
            {slides.map((slide, index) => (
                <ItemSlider
                    key={index} // Importante añadir key única
                    title={slide.title}
                    description={slide.description}
                    image={slide.image}
                    positionX={slide.positionX}
                />
            ))}
        </div>
    );
}