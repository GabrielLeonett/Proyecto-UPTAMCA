import pkg from 'pg';
const { Client } = pkg;

// Configura tu conexión
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'proyecto_uptamca',
    password: '1234',
    port: 5432,
});

// Conexión
client.connect();
if (client) {
    console.log('Conectado a la base de datos');
    client.
}
