/**
 * Importación del módulo nodemailer para el envío de correos electrónicos.
 * nodemailer es una librería de Node.js que permite enviar emails fácilmente.
 */
import nodemailer from "nodemailer";

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración de rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, 'logo.png'); // Ajusta esta ruta

// Verificación de existencia
if (!fs.existsSync(logoPath)) {
  throw new Error(`Archivo logo.png no encontrado en: ${logoPath}`);
}

/**
 * Configuración básica para el envío de correos electrónicos.
 * Este objeto contiene las credenciales y direcciones necesarias.
 */
const EMAIL_CONFIG = {
  user: "delegadogabrielleonett@gmail.com", // Correo electrónico del remitente (quien envía)
  pass: "eufe wcxu ltpu vzgh", // Contraseña de aplicación generada en Gmail (no usar la contraseña personal directamente)
};


const año = new Date

/**
 * Función asíncrona para enviar correos electrónicos.
 * Esta función configura el transporte y envía el email con las opciones especificadas.
 */
export async function enviarEmail({ Destinatario, Correo }) {
  /**
   * Configuración del transporte para nodemailer.
   * Se especifica el servicio (Gmail en este caso) y las credenciales de autenticación.
   */
  const transporter = nodemailer.createTransport({
    service: "gmail", // Usa el servicio de Gmail
    auth: {
      user: EMAIL_CONFIG.user, // Usuario del correo remitente
      pass: EMAIL_CONFIG.pass, // Contraseña de aplicación
    },
  });

  /**
   * Opciones del correo electrónico.
   * Aquí se define la estructura del mensaje a enviar.
   * Actualmente vacío (debe completarse con los datos reales).
   */
  const mailOptions = {
    from: EMAIL_CONFIG.user, // Remitente (normalmente el mismo que user)
    to: Destinatario, // Destinatario
    subject: Correo.asunto, // Asunto del correo
    html: `
      <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background-color: #1C75BA; padding: 20px; text-align: center;">
              <img src="cid:logo" alt="Logo UPTAMCA" style="width: 100px;">
          </header>

          <div style="padding: 20px;">
            ${Correo.html}
            <p style="color: #7f8c8d; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 15px;">
                      Este mensaje está dirigido exclusivamente al destinatario. Si usted no es la persona
                      a quien va dirigido, le solicitamos eliminarlo y notificarlo al remitente.
            </p>
          </div>
          <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
              <a href="http://localhost:5173/login" style="display: inline-block; background-color: #1C75BA; color: white; 
                        padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-bottom: 20px;">
                  Acceder a la plataforma
              </a>
          </div>
          <footer style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px;">
              © ${año.getUTCFullYear()} UPTAMCA. Todos los derechos reservados.
          </footer>
      </div>
        `, // Cuerpo del correo en formato HTML
    attachments: [{
      filename: 'logo.png',
      path: logoPath, // Ruta a tu archivo local
      cid: 'logo' // mismo ID que usas en el HTML
    }]
  };

  /**
   * Bloque try-catch para manejar el envío del correo.
   * Intenta enviar el email y captura posibles errores.
   */
  try {
    // Intenta enviar el correo con las opciones configuradas
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado!"); // Mensaje de éxito
  } catch (error) {
    // Captura y muestra cualquier error que ocurra durante el envío
    console.error("❌ Error al enviar:", error);
  }
}

/**
 * NOTAS IMPORTANTES:
 * 1. La contraseña usada debe ser una "Contraseña de aplicación" generada en la configuración de Gmail.
 * 2. El objeto mailOptions debe completarse con los datos reales del correo.
 * 3. Para mayor seguridad, considera usar variables de entorno para las credenciales.
 * 4. El servicio Gmail tiene límites de envío, para producción considera servicios como SendGrid o Mailgun.
 * 5. El campo 'html' permite enviar correos con formato HTML, también existe la opción 'text' para texto plano.
 */
