const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

let verificationCodes = {}; // Temporal storage

exports.sendCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email es requerido' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = crypto.randomBytes(16).toString('hex');

  verificationCodes[sessionId] = {
    email,
    code,
    createdAt: Date.now(),
    used: false,
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Hola,</h2>
      <p style="color: #555;">Gracias por usar nuestros servicios. Tu código de verificación es:</p>
      <h1 style="color: #000; background-color: #f0f0f0; padding: 10px; text-align: center;">${code}</h1>
      <p style="color: #555;">Por favor, ingresa este código para cambiar el nombre de usuario. Este código es válido por 5 minutos.</p>
      <hr style="border-top: 1px solid #ccc;">
      <p style="color: #999; font-size: 12px;">Si no solicitaste este código, por favor ignora este correo.</p>
    </div>
  `;

  try {
    await sendEmail(email, 'Código de Verificación', htmlContent);
    res.status(200).json({ success: true, sessionId, message: 'Código enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
  }
};

exports.verifyCode = (req, res) => {
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

  if (timeElapsed > 5 || verificationData.used) {
    delete verificationCodes[sessionId];
    return res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }

  if (verificationData.code === code) {
    verificationCodes[sessionId].used = true;
    res.status(200).json({ success: true, message: 'Código verificado correctamente' });
  } else {
    res.status(400).json({ success: false, message: 'Código incorrecto o expirado' });
  }
};
