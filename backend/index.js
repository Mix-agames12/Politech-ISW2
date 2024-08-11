const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configuración de CORS
app.use(cors({
  origin: '*', // Asegúrate de configurar esto correctamente para producción
}));

app.use(express.json());

// Almacenamiento temporal en memoria (no recomendado para producción)
let verificationCodes = {};

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

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = crypto.randomBytes(16).toString('hex');

  verificationCodes[sessionId] = {
    email: email,
    code: code,
    createdAt: Date.now(),
    used: false
  };

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
    from: 'politechsw@gmail.com', 
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
  const timeElapsed = (currentTime - verificationData.createdAt) / 1000 / 60;

  if (timeElapsed > 5) {
    delete verificationCodes[sessionId];
    return res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }

  if (verificationData.used) {
    return res.status(400).json({ success: false, message: 'El código ya ha sido utilizado' });
  }

  if (verificationData.code === code) {
    verificationCodes[sessionId].used = true;
    res.status(200).json({ success: true, message: 'Código verificado correctamente' });
  } else {
    res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }
});

// Ruta para procesar la transacción y enviar correos de confirmación
app.post('/process-transaction', async (req, res) => {
  const { senderEmail, receiverEmail, transactionDetails } = req.body;

  try {
    // Enviar correo al remitente
    const senderMsg = {
      to: senderEmail,
      from: 'politechsw@gmail.com',
      subject: 'Transferencia Exitosa',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hola,</h2>
          <p style="color: #555;">Tu transferencia fue realizada con éxito.</p>
          <p style="color: #555;">Detalles de la transacción:</p>
          <ul>
            <li>Cuenta de Origen: ${transactionDetails.senderAccount}</li>
            <li>Cuenta de Destino: ${transactionDetails.receiverAccount}</li>
            <li>Monto: $${transactionDetails.amount}</li>
            <li>Descripción: ${transactionDetails.description}</li>
            <li>Fecha: ${transactionDetails.date}</li>
          </ul>
          <p style="color: #555;">Gracias por usar nuestros servicios.</p>
        </div>
      `,
    };

    await sgMail.send(senderMsg);

    // Enviar correo al receptor
    const receiverMsg = {
      to: receiverEmail,
      from: 'politechsw@gmail.com',
      subject: 'Has Recibido una Transferencia',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hola,</h2>
          <p style="color: #555;">Has recibido una transferencia en tu cuenta.</p>
          <p style="color: #555;">Detalles de la transacción:</p>
          <ul>
            <li>Cuenta de Origen: ${transactionDetails.senderAccount}</li>
            <li>Cuenta de Destino: ${transactionDetails.receiverAccount}</li>
            <li>Monto: $${transactionDetails.amount}</li>
            <li>Descripción: ${transactionDetails.description}</li>
            <li>Fecha: ${transactionDetails.date}</li>
          </ul>
          <p style="color: #555;">Gracias por usar nuestros servicios.</p>
        </div>
      `,
    };

    await sgMail.send(receiverMsg);

    res.status(200).json({ success: true, message: 'Correos enviados con éxito' });
  } catch (error) {
    console.error('Error al enviar correos de confirmación:', error.response ? error.response.body : error.message);
    res.status(500).json({ success: false, message: 'No se pudo enviar los correos de confirmación' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
