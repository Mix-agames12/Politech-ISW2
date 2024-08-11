const { sendEmail } = require('../utils/sendEmail');

exports.processTransfer = async (req, res) => {
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
            <li>Nombre del Beneficiario: ${transactionDetails.receiverName}</li>
            <li>Monto: $${transactionDetails.amount}</li>
            <li>Descripción: ${transactionDetails.description}</li>
            <li>Fecha: ${transactionDetails.date}</li>
          </ul>
          <p style="color: #555;">Gracias por usar nuestros servicios.</p>
        </div>
      `,
    };

    await sendEmail(senderEmail, senderMsg.subject, senderMsg.html);

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
            <li>Nombre del Remitente: ${transactionDetails.senderName}</li>
            <li>Monto: $${transactionDetails.amount}</li>
            <li>Fecha: ${transactionDetails.date}</li>
          </ul>
          <p style="color: #555;">Gracias por usar nuestros servicios.</p>
        </div>
      `,
    };

    await sendEmail(receiverEmail, receiverMsg.subject, receiverMsg.html);

    res.status(200).json({ success: true, message: 'Correos enviados con éxito' });
  } catch (error) {
    console.error('Error al enviar correos de confirmación:', error);
    res.status(500).json({ success: false, message: 'No se pudo enviar los correos de confirmación' });
  }
};
