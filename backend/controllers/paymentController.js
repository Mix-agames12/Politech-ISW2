const { sendEmail } = require('../utils/sendEmail');

exports.processPayment = async (req, res) => {
  const { email, paymentDetails } = req.body;

  try {
    // Enviar correo de confirmación al remitente (cliente que hizo el pago)
    const confirmationMsg = {
      to: email,
      from: 'politechsw@gmail.com',
      subject: 'Confirmación de Pago Realizado',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Hola,</h2>
          <p style="color: #555;">Tu pago ha sido realizado con éxito. Aquí están los detalles:</p>
          <p><strong>Valor:</strong> $${paymentDetails.amount}</p>
          <p><strong>Desde:</strong> ${paymentDetails.senderAccount}</p>
          <p><strong>Nombre del remitente:</strong> ${paymentDetails.senderName}</p>
          <p><strong>Servicio:</strong> ${paymentDetails.service}</p>
          <p><strong>Fecha:</strong> ${paymentDetails.date}</p>
        </div>
      `,
    };

    await sendEmail(email, confirmationMsg.subject, confirmationMsg.html);

    res.status(200).json({ success: true, message: 'Correo de confirmación enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
    res.status(500).json({ success: false, message: 'No se pudo enviar el correo de confirmación' });
  }
};
