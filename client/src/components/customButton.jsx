import Button from '@mui/material/Button';


export default function CustomButton({ tipo = 'primary', ...props }) {
  return (
    <Button
      sx={{
        // Estilos base (equivalente a %Botones)
        padding: '8px 16px',
        borderRadius: '4px',
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.5s ease',

        // Estilos dinámicos según el tipo
        ...(tipo === 'primary' && {
          backgroundColor: '#53A6E5', // $Primary-500
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: '#0d47a1', // $Primary-900
          },
          '&:active': {
            backgroundColor: '#1565c0', // $Primary-700
          },
        }),
        ...(tipo === 'secondary' && {
          backgroundColor: '#FFDCBE', // $Secondary-100
          color: '#FE973D', // $Secondary-700
          border: '1.5px solid #FEAE68', // $Secondary-500
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: '#FFC593', // $Secondary-400
          },
          '&:active': {
            backgroundColor: '#FFC593', // $Secondary-800
          },
        }),
        ...(tipo === 'extra' && {
          backgroundColor: '#f5f5f5', // $Primary-50
          color: '#64b5f6', // $Primary-400
          border: '1px solid #53A6E5', // $Primary-200
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: '#e0e0e0', // $Primary-700 (ajustado a gris)
          },
          '&:active': {
            backgroundColor: '#bdbdbd', // $Primary-800 (ajustado a gris)
          },
        }),
      }}
      {...props} // 👈 Pasa todas las props nativas de MUI Button (onClick, disabled, etc.)
    >
      {props.children}
    </Button>
  );
}