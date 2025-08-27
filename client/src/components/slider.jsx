// Carousel3D.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { id: 1, content: "https://picsum.photos/id/1015/1200/800" },
  { id: 2, content: "https://picsum.photos/id/1016/1200/800" },
  { id: 3, content: "https://picsum.photos/id/1025/1200/800" },
  { id: 4, content: "https://picsum.photos/id/1035/1200/800" },
];

export default function slide() {
  const [index, setIndex] = useState(0);
  const SIZE = 520;            // tamaño del “cubo” (ancho)
  const DEPTH = SIZE / 2;      // distancia Z correcta para formar el cubo
  const autoplayRef = useRef(null);

  const nextSlide = () => setIndex((p) => (p + 1) % slides.length);
  const prevSlide = () => setIndex((p) => (p - 1 + slides.length) % slides.length);

  // Autoplay inteligente
  useEffect(() => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(autoplayRef.current);
  }, [index]);

  // Soporte teclado
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  return (
    <div
      className="relative w-full h-[520px] flex items-center justify-center select-none"
      style={{ perspective: 1200 }}          // ✅ perspectiva real
      onKeyDown={onKeyDown}
      tabIndex={0}                           // para capturar teclado
    >
      {/* Fondo glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-900 via-slate-900 to-black" />
      <div className="absolute inset-16 -z-10 blur-3xl opacity-40 bg-[radial-gradient(circle_at_center,rgba(254, 254, 254, 0.6),transparent_60%)]" />

      <motion.div
        className="relative rounded-2xl shadow-2xl overflow-visible"
        style={{
          width: SIZE,
          height: 320,
          transformStyle: "preserve-3d",     // ✅ mantiene hijos en 3D
          willChange: "transform",
        }}
        animate={{ rotateY: index * -90 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        drag="x"
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) nextSlide();
          else if (info.offset.x > 80) prevSlide();
        }}
      >
        {slides.map((slide, i) => {
          const rotation = i * 90;
          return (
            <div
              key={slide.id}
              className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                transform: `rotateY(${rotation}deg) translateZ(${DEPTH}px)`,
                backfaceVisibility: "hidden",       // ✅ oculta caras traseras
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <img
                src={slide.content}
                alt={`slide-${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              <div className="absolute bottom-3 left-3 right-3 text-white/90 font-semibold text-lg">
                Slide {i + 1}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Controles */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md shadow-xl"
        aria-label="Anterior"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-md shadow-xl"
        aria-label="Siguiente"
      >
        <ChevronRight size={26} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              index === i ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
