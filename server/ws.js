import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });
const clients = new Map(); // Guardar clientes conectados con un identificador

server.on('connection', (socket, req) => {
    const userId = req.headers['sec-websocket-key']; // Usa un identificador único del cliente
    clients.set(userId, socket);

    console.log(`Cliente conectado: ${userId}`);

    socket.on('message', message => {
        console.log(`Mensaje recibido de ${userId}: ${message}`);

        // Enviar mensaje a un usuario específico
        const [targetId, content] = message.toString().split(':');
        if (clients.has(targetId)) {
            clients.get(targetId).send(`Mensaje privado de ${userId}: ${content}`);
        } else {
            socket.send('Usuario no encontrado.');
        }
    });

    socket.on('close', () => {
        console.log(`Cliente desconectado: ${userId}`);
        clients.delete(userId); // Remover cliente al desconectarse
    });

    socket.on('error', error => {
        console.error('Error en la conexión:', error);
    });
});

console.log('Servidor WebSocket escuchando en el puerto 8080');
