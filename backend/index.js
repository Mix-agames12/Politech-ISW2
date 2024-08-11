const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Almacenamiento temporal en memoria (no recomendado para producción)
let verificationCodes = {};

// Configuración de CORS
app.use(cors({
  origin: '*', // Asegúrate de configurar esto correctamente para producción
}));

app.use(express.json());

// Configurar la API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ruta para la raíz ("/")
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Ruta para enviar el código de verificación
app.post('/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email es requerido' });
  }

  // Genera un código de verificación de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Genera un ID de sesión único para esta solicitud
  const sessionId = crypto.randomBytes(16).toString('hex');

  // Almacena el código en la memoria asociándolo al email y al sessionId
  verificationCodes[sessionId] = {
    email: email,
    code: code,
    createdAt: Date.now(),
    used: false  // Nueva propiedad para marcar si el código ha sido usado
  };

  // Contenido HTML para el correo
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Hola,</h2>
      <p style="color: #555;">Gracias por usar nuestros servicios. Tu código de verificación es:</p>
      <h1 style="color: #000; background-color: #f0f0f0; padding: 10px; text-align: center;">${code}</h1>
      <p style="color: #555;">Por favor, ingresa este código para confirmar tu transacción. Este código es válido por 5 minutos.</p>
      <hr style="border-top: 1px solid #ccc;">
      <p style="color: #999; font-size: 12px;">
        Si no solicitaste este código, por favor ignora este correo.
      </p>
    </div>
  `;

  const msg = {
    to: email,
    from: 'politechsw@gmail.com', // Correo autorizado en SendGrid
    subject: 'Código de Verificación',
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, sessionId: sessionId, message: 'Código enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error.response ? error.response.body : error.message);
    res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
  }
});

// Ruta para verificar el código de verificación y enviar correos post-transacción
app.post('/verify-code', async (req, res) => {
  const { sessionId, code, transactionData } = req.body;

  if (!sessionId || !code) {
    return res.status(400).json({ success: false, message: 'Session ID y código son requeridos' });
  }

  const verificationData = verificationCodes[sessionId];

  if (!verificationData) {
    return res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }

  const currentTime = Date.now();
  const timeElapsed = (currentTime - verificationData.createdAt) / 1000 / 60; // Tiempo transcurrido en minutos

  if (timeElapsed > 5) {
    // El código ha expirado
    delete verificationCodes[sessionId];
    return res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }

  // Verifica si el código ya ha sido utilizado
  if (verificationData.used) {
    return res.status(400).json({ success: false, message: 'El código ya ha sido utilizado' });
  }

  // Compara el código enviado con el almacenado
  if (verificationData.code === code) {
    // Marca el código como utilizado
    verificationCodes[sessionId].used = true;

    // Lógica para enviar correos
    try {
      const senderEmail = verificationData.email;
      const receiverEmail = transactionData.receiverEmail; // Este dato debería venir en el cuerpo de la solicitud

      // Correo al remitente con el comprobante adjunto
      const senderMsg = {
        to: senderEmail,
        from: 'politechsw@gmail.com',
        subject: 'Transacción Exitosa',
        text: 'Tu transacción ha sido realizada con éxito.',
        attachments: [
          {
            filename: 'comprobante.pdf',
            path: '/path/to/generated-pdf.pdf', // Cambia esta ruta al archivo PDF generado
            contentType: 'application/pdf'
          }
        ]
      };

      // Correo al receptor notificando la transacción
      const receiverMsg = {
        to: receiverEmail,
        from: 'politechsw@gmail.com',
        subject: 'Has Recibido una Transacción',
        text: `Hola, has recibido una transacción de ${senderEmail}.`
      };

      // Envía ambos correos
      await sgMail.send(senderMsg);
      await sgMail.send(receiverMsg);

      res.status(200).json({ success: true, message: 'Código verificado y correos enviados correctamente' });
    } catch (error) {
      console.error('Error al enviar los correos:', error);
      res.status(500).json({ success: false, message: 'Código verificado pero no se pudieron enviar los correos' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
