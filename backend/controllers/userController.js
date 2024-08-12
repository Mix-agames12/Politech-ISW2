const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// En memoria para almacenar temporalmente los códigos de verificación
let verificationCodes = {};

const sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email es requerido' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Almacenar el código en memoria temporal
    verificationCodes[sessionId] = {
        email,
        code,
        createdAt: Date.now(),
        used: false
    };

    const msg = {
        to: email,
        from: 'politechsw@gmail.com',
        subject: 'Código de Verificación',
        html: `
            <div>
                <p>Tu código de verificación es:</p>
                <h1>${code}</h1>
                <p>Este código es válido por 5 minutos.</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ success: true, sessionId, message: 'Código enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error.response ? error.response.body : error.message);
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
};

const verifyCode = async (req, res) => {
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
        res.status(200).json({ success: true, email: verificationData.email, message: 'Código verificado correctamente' });
    } else {
        res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
};

module.exports = {
    sendVerificationCode,
    verifyCode
};
