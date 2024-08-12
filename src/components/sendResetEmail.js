// src/utils/sendResetEmail.js
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export const sendResetEmail = async (email) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
