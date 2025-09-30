/**
 * @module emailService
 * @description Módulo para el envío de correos electrónicos utilizando nodemailer.
 * Proporciona funciones para enviar emails con plantillas HTML y manejo de adjuntos.
 * @requires nodemailer
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
 * @constant {Object} EMAIL_CONFIG
 * @description Configuración básica para el servicio de correo electrónico
 * @property {string} user - Correo electrónico del remitente
 * @property {string} pass - Contraseña de aplicación generada en Gmail
 */
const EMAIL_CONFIG = {
  user: "delegadogabrielleonett@gmail.com",
  pass: "eufe wcxu ltpu vzgh" // Debería reemplazarse por variables de entorno en producción
};

const año = new Date();

/**
 * @async
 * @function enviarEmail
 * @description Envía un correo electrónico utilizando nodemailer con plantilla HTML
 * @param {Object} params - Objeto con parámetros de envío
 * @param {string} params.Destinatario - Dirección de correo del destinatario
 * @param {Object} params.Correo - Configuración específica del correo
 * @param {string} params.Correo.asunto - Asunto del correo electrónico
 * @param {string} params.Correo.html - Contenido HTML del cuerpo del correo
 * @returns {Promise<void>} No retorna valor pero puede lanzar errores
 * @throws {Error} Cuando falla el envío del correo
 * 
 * @example
 * await enviarEmail({
 *   Destinatario: 'destinatario@example.com',
 *   Correo: {
 *     asunto: 'Asunto importante',
 *     html: '<p>Contenido del correo</p>'
 *   }
 * });
 */
export async function enviarEmail({ Destinatario, Correo }) {
  /**
   * @type {nodemailer.Transporter}
   * @description Configuración del transporte para nodemailer usando servicio Gmail
   */
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass
    }
  });

  /**
   * @type {nodemailer.SendMailOptions}
   * @description Opciones del correo electrónico con plantilla HTML estructurada
   */
  const mailOptions = {
    from: EMAIL_CONFIG.user,
    to: Destinatario,
    subject: Correo.asunto,
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

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw {message: "Error al enviar el correo electrónico", 
      tipo: 'Correo'
    };
  }
}

/**
 * @description Consideraciones de seguridad importantes para el módulo de correo:
 * 1. Las credenciales deberían manejarse mediante variables de entorno en producción
 * 2. Gmail tiene límites de envío (500 correos/día para cuentas estándar)
 * 3. Para producción considerar servicios especializados como SendGrid o Mailgun
 * 4. Nunca incluir contraseñas directamente en el código fuente
 * 5. Implementar mecanismos de reintento para fallos temporales
 */