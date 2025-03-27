import { Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ItemSliderProps {
  title: string;
  description: string;
  image: string;
  opacity?: `opacity-${number}`;
  positionX?: number;
  zIndex?: `z-${number}`;
  duration?: number;
}

export default function ItemSlider({
  title,
  description,
  image,
  opacity = "opacity-100",
  positionX = 100,
  zIndex = "z-0",
  duration = 50
}: ItemSliderProps) {
  const [x, setX] = useState(positionX);

  // Usa useEffect para manejar efectos secundarios
  useEffect(() => {
    if (x === 1200) setX(-500);
    const timer = setTimeout(() => {
      setX(x + 2);
    }, duration);


    // Limpia el timeout cuando el componente se desmonta
    return () => clearTimeout(timer);
  }, [x, duration]); // Dependencias del efecto


if (x === 1200) setX(-500);

  return (
    <motion.div
      id="example"
      className={`absolute top-0 ${zIndex} w-1/2`}
      animate={{ x }}
      transition={{ type: "spring", stiffness: 50 }}
    >
      <div
        className={`item-slider bg-cover bg-center flex justify-end items-start flex-col ${opacity} h-64 p-6 rounded-lg shadow-lg`}
        style={{
          backgroundImage: `linear-gradient(to bottom, hsla(0, 0%, 19.2%, 0.6), rgba(253, 250, 250, 0.81)), url('/storage/${image}')`
        }}
      >
        <Typography component="h2" variant="h3" className="text-white mb-2">
          {title}
        </Typography>
        <Typography component="p" className="text-white">
          {description}
        </Typography>
      </div>
    </motion.div>
  );
}