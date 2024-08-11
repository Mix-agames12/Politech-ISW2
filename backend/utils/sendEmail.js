const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: 'politechsw@gmail.com', 
    subject,
    html: htmlContent,
  };

  await sgMail.send(msg);
};
