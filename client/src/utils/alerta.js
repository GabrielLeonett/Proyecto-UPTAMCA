import Swal from "sweetalert2";

export function mostrarAlerta(datos) {
    if(!datos.success){
        Swal.fire({
            title: datos.title,
            text: datos.text,
            icon: 'error',
        })
    }else{
        Swal.fire({
            title: datos.title,
            text: datos.text,
            icon: 'success',
        })
    }
}
