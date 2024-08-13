const nodemailer = require('nodemailer');

exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    // Configura el transportador de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'politechsw@gmail.com', // Tu dirección de correo de Gmail
        pass: 'Prueba1234.'// Tu contraseña de la cuenta de Gmail
      }
    });

    // Configura los detalles del correo electrónico
    const mailOptions = {
      from: '"Politech" <politechsw@gmail.com>', // Remitente
      to: to, // Receptor
      subject: subject, // Asunto
      html: htmlContent // Contenido en formato HTML
    };

    // Envía el correo
    const result = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', result.response);
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    throw err;
  }
};
