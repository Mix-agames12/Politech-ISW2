const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Asegúrate de que tu entorno esté configurado con las credenciales adecuadas
  // No necesitas databaseURL si estás utilizando Firestore
});

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

// Nueva ruta para procesar la transacción y enviar correos electrónicos
app.post('/process-transaction', async (req, res) => {
  const { senderEmail, receiverAccount, transactionDetails } = req.body;

  try {
    // Obtener la colección `clientes` y buscar el correo del receptor
    const receiverSnapshot = await admin.firestore().collection('clientes').where('accountNumber', '==', receiverAccount).get();

    if (receiverSnapshot.empty) {
      return res.status(404).json({ success: false, message: 'Cuenta de destino no encontrada.' });
    }

    const receiverData = receiverSnapshot.docs[0].data();
    const receiverEmail = receiverData.email;

    // Enviar correo al remitente
    const senderMessage = {
      to: senderEmail,
      from: 'politechsw@gmail.com',
      subject: 'Transferencia Exitosa',
      text: `Hola, tu transferencia de ${transactionDetails.amount} a la cuenta ${transactionDetails.receiverAccount} fue exitosa.`,
      attachments: [
        {
          content: transactionDetails.pdfBase64,
          filename: 'comprobante.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        }
      ]
    };

    // Enviar correo al receptor
    const receiverMessage = {
      to: receiverEmail,
      from: 'politechsw@gmail.com',
      subject: 'Has recibido una transferencia',
      text: `Hola, has recibido una transferencia de ${transactionDetails.amount} desde la cuenta ${transactionDetails.senderAccount}.`,
    };

    await sgMail.send(senderMessage);
    await sgMail.send(receiverMessage);

    res.status(200).json({ success: true, message: 'Correos enviados con éxito' });
  } catch (error) {
    console.error('Error al procesar la transacción y enviar correos:', error.message);
    res.status(500).json({ success: false, message: 'Error al procesar la transacción y enviar correos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
