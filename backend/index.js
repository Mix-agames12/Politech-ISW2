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
    createdAt: Date.now()
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

// Ruta para verificar el código de verificación
app.post('/verify-code', (req, res) => {
  const { sessionId, code } = req.body;

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

  // Compara el código enviado con el almacenado
  if (verificationData.code === code) {
    // Si es correcto, se elimina el código para evitar reusos
    delete verificationCodes[sessionId];
    res.status(200).json({ success: true, message: 'Código verificado correctamente' });
  } else {
    res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
