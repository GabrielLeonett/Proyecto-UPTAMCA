import ResponsiveAppBar from '@/components/navbar';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <>
            <Head title="Regístrate" />
            <ResponsiveAppBar pages={['Universidad', 'Academico', 'Servicios', 'Tramites']} backgroundColor />
            
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Formulario de Registro</h1>
                <form action="/register" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Campo para el ID */}
                    <div>
                        <label htmlFor="id">ID:</label>
                        <input type="text" id="id" name="id" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para los Nombres */}
                    <div>
                        <label htmlFor="nombres">Nombres:</label>
                        <input type="text" id="nombres" name="nombres" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para el Email */}
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para la Dirección */}
                    <div>
                        <label htmlFor="direccion">Dirección:</label>
                        <input type="text" id="direccion" name="direccion" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para el Teléfono Móvil */}
                    <div>
                        <label htmlFor="telefonoMovil">Teléfono Móvil:</label>
                        <input type="tel" id="telefonoMovil" name="telefonoMovil" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para el Teléfono Local */}
                    <div>
                        <label htmlFor="telefonoLocal">Teléfono Local:</label>
                        <input type="tel" id="telefonoLocal" name="telefonoLocal" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para la Fecha de Nacimiento */}
                    <div>
                        <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
                        <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Campo para el Género */}
                    <div>
                        <label htmlFor="genero">Género:</label>
                        <select id="genero" name="genero" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    {/* Campo para la Contraseña */}
                    <div>
                        <label htmlFor="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    {/* Botón de Envío */}
                    <div>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Registrar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}