import { Typography } from "@mui/material";

interface ItemSliderProps {
  ancho: "w-[300px]" | "w-[400px]" | "w-[500px]";
  alto: "h-[200px]" | "h-[220px]" | "h-[250px]";
  title: string;
  description: string;
  image: string;
  opacity?: `opacity-${number}`;
}

export default function ItemSlider({ 
  ancho,
  alto,
  title, 
  description, 
  image, 
  opacity = "opacity-100" 
}: ItemSliderProps) {
  return (
    <div 
      className={`item-slider ${alto} ${ancho} bg-cover bg-center flex justify-end items-start flex-col ${opacity}`}
      style={{ 
        backgroundImage: `linear-gradient(to bottom, hsla(0, 0%, 19.2%, 0.6), rgba(253, 250, 250, 0.81)), url('/storage/${image}')`
      }}
    >
      <Typography component="h2" variant="h3">
        {title}
      </Typography>
      <Typography component="p">
        {description}
      </Typography>
    </div>
  );
}