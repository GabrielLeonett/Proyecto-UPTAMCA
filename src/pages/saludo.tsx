
export default function Saludo(nombre?: string) {

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
                ¡Hola, {nombre? nombre : 'Mundo'}!
            </h1>
            <p className="text-gray-700 text-center">
                Prop recibido correctamente desde Laravel.
            </p>
        </div>
    );
}