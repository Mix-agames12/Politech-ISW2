const { db } = require('../firebaseConfig');
const { doc, setDoc, getDoc } = require('firebase/firestore');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const addResetToken = async (email, token) => {
    const resetTokenDoc = doc(db, 'resetTokens', token);
    await setDoc(resetTokenDoc, {
        email,
        token,
        createdAt: new Date().toISOString(),
    });
};

const verifyResetToken = async (token) => {
    const resetTokenRef = doc(db, 'resetTokens', token);
    const resetTokenDoc = await getDoc(resetTokenRef);

    if (!resetTokenDoc.exists()) {
        return null;
    }

    const { email, createdAt } = resetTokenDoc.data();

    const now = new Date();
    const tokenCreatedAt = new Date(createdAt);
    const diff = now - tokenCreatedAt;

    if (diff > 3600000) { // 1 hora en milisegundos
        return null;
    }

    return email;
};

const updateUsername = async (email, newUsername) => {
    const userRef = doc(db, 'users', email);
    await setDoc(userRef, {
        username: newUsername
    }, { merge: true });
};

const sendResetEmail = async (email, token) => {
    const resetLink = `https://tu-front-end.com/reset-username?token=${token}`;

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
        await addResetToken(email, token);
        await sendResetEmail(email, token);
        res.status(200).json({ success: true, message: 'Correo de restablecimiento enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error.response ? error.response.body : error.message);
        res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
    }
};

const resetUsername = async (req, res) => {
    const { token, newUsername } = req.body;

    if (!token || !newUsername) {
        return res.status(400).json({ success: false, message: 'Token y nuevo nombre de usuario son requeridos' });
    }

    try {
        const email = await verifyResetToken(token);

        if (!email) {
            return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
        }

        await updateUsername(email, newUsername);
        res.status(200).json({ success: true, message: 'Nombre de usuario actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el nombre de usuario:', error);
        res.status(500).json({ success: false, message: 'No se pudo actualizar el nombre de usuario' });
    }
};

module.exports = {
    requestUsernameReset,
    resetUsername
};
