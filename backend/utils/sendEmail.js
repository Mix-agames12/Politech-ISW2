const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    const request = mailjet
      .post("send", { version: 'v3.1' })
      .request({
        "Messages": [
          {
            "From": {
              "Email": "politechsw@gmail.com",
              "Name": "Politech"
            },
            "To": [
              {
                "Email": to,
                "Name": "Usuario"
              }
            ],
            "Subject": subject,
            "HTMLPart": htmlContent,
          }
        ]
      });
    const result = await request;
    console.log(result.body);
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    throw err;
  }
};
