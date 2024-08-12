const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetEmail = async (email, token) => {
    const resetLink = `https://politechsw.web.app/change-username?token=${token}`;

    const msg = {
        to: email,
        from: 'politechsw@gmail.com',
        subject: 'Cambio de Nombre de Usuario',
        html: `
            <div>
                <p>Has solicitado cambiar tu nombre de usuario. Haz clic en el enlace de abajo para continuar:</p>
                <a href="${resetLink}">Cambiar Nombre de Usuario</a>
                <p>Si no has solicitado este cambio, ignora este mensaje.</p>
            </div>
        `,
    };

    await sgMail.send(msg);
};

const requestUsernameReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email es requerido' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    try {
        // Envía el correo con el token
        await sendResetEmail(email, token);
        res.status(200).json({ success: true, message: 'Correo de restablecimiento enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error.response ? error.response.body : error.message);
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
};

module.exports = {
    requestUsernameReset
};
