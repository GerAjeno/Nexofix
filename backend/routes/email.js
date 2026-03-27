import express from 'express';
import nodemailer from 'nodemailer';
import { db } from '../database.js';

const router = express.Router();

const getSmtpConfig = async () => {
    const doc = await db.collection('configuracion').doc('general').get();
    if (doc.exists) return doc.data();
    return {};
};

// POST /api/email/enviar-cotizacion
router.post('/enviar-cotizacion', async (req, res) => {
  try {
    const { cotizacionId, clienteEmail, base64Pdf, clienteNombre, numeroCotizacion } = req.body;

    if (!clienteEmail) {
      return res.status(400).json({ error: 'El email del cliente es obligatorio' });
    }

    if (!base64Pdf) {
      return res.status(400).json({ error: 'Falta el documento PDF adjunto' });
    }

    const config = await getSmtpConfig();

    if (!config || !config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      return res.status(400).json({ error: 'El servidor de correos (SMTP) no está configurado en los Ajustes del sistema.' });
    }

    // Configurar el transportador (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_puerto || 465,
      secure: config.smtp_puerto == 465, // true para 465, false para otros puertos
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
      }
    });

    // Validar conexión
    await transporter.verify();

    // Eliminar el prefijo 'data:application/pdf;base64,'
    const base64Data = base64Pdf.replace(/^data:application\/pdf;base64,/, "");

    // Opciones del correo
    const mailOptions = {
      from: `"${config.empresa_nombre || 'NexoFix'}" <${config.smtp_user}>`,
      to: clienteEmail,
      subject: `Cotización de Servicio ${numeroCotizacion || ''} - ${config.empresa_nombre || ''}`,
      text: `Estimado/a ${clienteNombre},\n\nAdjunto le enviamos nuestra última propuesta técnico-comercial para su revisión.\n\nQuedamos a su entera disposición para cualquier consulta.\n\nAtte.\nEquipo ${config.empresa_nombre || 'NexoFix'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #007bff;">Propuesta Técnico Comercial</h2>
          <p>Estimado/a <strong>${clienteNombre}</strong>,</p>
          <p>Esperando que se encuentre muy bien, le escribimos para hacerle llegar en archivo adjunto nuestra cotización <strong>${numeroCotizacion || ''}</strong> solicitada.</p>
          <p>Lo invitamos a revisar el documento PDF para conocer los detalles del trabajo, itemizado comercial y condiciones estipuladas.</p>
          <br/>
          <p>Quedamos atentos a sus comentarios o aprobaciones.</p>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            Atentamente,<br/>
            <strong>Equipo Operativo de ${config.empresa_nombre || 'NexoFix'}</strong>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Cotizacion_${numeroCotizacion || 'Documento'}.pdf`,
          content: base64Data,
          encoding: 'base64',
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Correo enviado correctamente', messageId: info.messageId });

  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ error: error.message || 'Error interno enviando correo' });
  }
});

export default router;
