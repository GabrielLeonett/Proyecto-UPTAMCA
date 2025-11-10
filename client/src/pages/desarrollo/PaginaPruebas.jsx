import { Stage, Layer, Rect, Circle, Text, Group, Transformer } from "react-konva";
import { Box, Typography, useTheme, ButtonGroup, Button } from "@mui/material";
import NavBar from "../../components/navbar";
import { useState, useRef, useEffect } from "react";
import CustomButton from "../../components/customButton";

export default function PaginaPruebas() {
  const theme = useTheme();
  const [selectedShape, setSelectedShape] = useState("rect");
  const [figuras, setFiguras] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const transformerRef = useRef();

  const colores = [
    "rgba(136, 219, 119, 0.8)",
    "rgba(255, 107, 107, 0.8)",
    "rgba(74, 144, 226, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(170, 102, 204, 0.8)",
    "rgba(86, 204, 242, 0.8)",
    "rgba(255, 133, 82, 0.8)"
  ];

  const añadirFigura = () => {
    const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
    
    const nuevaFigura = {
      id: Date.now(),
      tipo: selectedShape,
      x: Math.random() * 700,
      y: Math.random() * 300,
      fill: colorAleatorio,
      stroke: "black",
      strokeWidth: 2,
    };

    // Propiedades específicas por tipo
    if (selectedShape === "rect") {
      nuevaFigura.width = 120;
      nuevaFigura.height = 80;
      nuevaFigura.cornerRadius = 8;
    } else if (selectedShape === "circle") {
      nuevaFigura.radius = 50;
    } else if (selectedShape === "text") {
      nuevaFigura.text = "Texto editable";
      nuevaFigura.fontSize = 20;
      nuevaFigura.width = 150;
      nuevaFigura.height = 40;
    }

    setFiguras([...figuras, nuevaFigura]);
  };

  const limpiarFiguras = () => {
    setFiguras([]);
    setSelectedId(null);
  };

  // Efecto para el transformer (redimensionar)
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = transformerRef.current.getStage().findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
      }
    }
  }, [selectedId]);

  const manejarClickStage = (e) => {
    // Click en área vacía = deseleccionar
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      return;
    }

    // Click en figura = seleccionar
    const id = e.target.attrs.id || e.target.parent.attrs.id;
    setSelectedId(id);
  };

  const actualizarFigura = (id, nuevasPropiedades) => {
    setFiguras(figuras.map(figura =>
      figura.id === id ? { ...figura, ...nuevasPropiedades } : figura
    ));
  };

  const renderFigura = (figura) => {
    const estaSeleccionada = figura.id === selectedId;

    const propsComunes = {
      id: figura.id.toString(),
      x: figura.x,
      y: figura.y,
      fill: figura.fill,
      stroke: estaSeleccionada ? "#00ff00" : "black",
      strokeWidth: estaSeleccionada ? 3 : 2,
      draggable: true,
      onDragEnd: (e) => {
        actualizarFigura(figura.id, {
          x: e.target.x(),
          y: e.target.y()
        });
      },
      onClick: (e) => {
        e.cancelBubble = true; // Evitar que el stage también capture el click
        setSelectedId(figura.id);
      },
      onTransformEnd: (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale
        node.scaleX(1);
        node.scaleY(1);

        // Actualizar propiedades según el tipo
        if (figura.tipo === "rect") {
          actualizarFigura(figura.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY)
          });
        } else if (figura.tipo === "circle") {
          actualizarFigura(figura.id, {
            x: node.x(),
            y: node.y(),
            radius: Math.max(5, node.radius() * Math.max(scaleX, scaleY))
          });
        } else if (figura.tipo === "text") {
          actualizarFigura(figura.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            fontSize: Math.max(8, figura.fontSize * scaleX)
          });
        }
      }
    };

    switch (figura.tipo) {
      case "rect":
        return (
          <Rect
            {...propsComunes}
            width={figura.width}
            height={figura.height}
            cornerRadius={figura.cornerRadius}
          />
        );
      case "circle":
        return (
          <Circle
            {...propsComunes}
            radius={figura.radius}
          />
        );
      case "text":
        return (
          <Text
            {...propsComunes}
            text={figura.text}
            width={figura.width}
            fontSize={figura.fontSize}
            fontFamily="Arial"
            align="center"
            verticalAlign="middle"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <NavBar backgroundColor />
      <br /><br /><br /><br /><br />
      
      <Box sx={{ padding: theme.spacing(3), backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        <Typography component={"h1"} variant="h3" gutterBottom>
          Figuras Básicas - Mover y Redimensionar
        </Typography>

        {/* Controles */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selecciona el tipo de figura:
          </Typography>
          <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            <Button 
              onClick={() => setSelectedShape("rect")}
              variant={selectedShape === "rect" ? "contained" : "outlined"}
            >
              Cuadrado
            </Button>
            <Button 
              onClick={() => setSelectedShape("circle")}
              variant={selectedShape === "circle" ? "contained" : "outlined"}
            >
              Círculo
            </Button>
            <Button 
              onClick={() => setSelectedShape("text")}
              variant={selectedShape === "text" ? "contained" : "outlined"}
            >
              Texto
            </Button>
          </ButtonGroup>
        </Box>

        {/* Canvas */}
        <Box sx={{ border: `2px solid ${theme.palette.divider}`, borderRadius: 2, p: 2, backgroundColor: "white" }}>
          <Stage 
            width={1500} 
            height={500} 
            onMouseDown={manejarClickStage}
          >
            <Layer>
              {figuras.map(renderFigura)}
              
              {/* Transformer para redimensionar */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limitar el tamaño mínimo
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </Box>

        {/* Información y botones */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom>
            Figuras: {figuras.length} | Tipo seleccionado: {
              selectedShape === "rect" ? "Cuadrado" :
              selectedShape === "circle" ? "Círculo" : "Texto"
            }
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            💡 Click para seleccionar • Arrastra para mover • Usa los handles para redimensionar
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <CustomButton onClick={añadirFigura} variant="contained">
              Añadir {selectedShape === "rect" ? "Cuadrado" : selectedShape === "circle" ? "Círculo" : "Texto"}
            </CustomButton>
            <CustomButton onClick={limpiarFiguras} variant="outlined" color="error">
              Limpiar Todo
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </>
  );
}