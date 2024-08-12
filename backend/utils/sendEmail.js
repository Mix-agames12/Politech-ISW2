const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    const request = await mailjet.post("send", { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "politechsw@gmail.com",
            Name: "Politech",
          },
          To: [
            {
              Email: to,
            }
          ],
          Subject: subject,
          HTMLPart: htmlContent,
        }
      ]
    });

    console.log('Email sent successfully:', request.body);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};
