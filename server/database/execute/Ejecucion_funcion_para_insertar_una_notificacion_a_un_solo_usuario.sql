-- Ejemplo de llamada a la función
SELECT guardar_notificacion_usuario(
    999999999,                      -- user_id (cédula del usuario)
    'friend_request',               -- type
    'Nueva solicitud de amistad',   -- title
    'Juan Pérez quiere ser tu amigo', -- body
    '{"sender_id": 987654321}'::jsonb  -- metadata (opcional)
);