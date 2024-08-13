const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; // Puedes establecer directamente el puerto aquí

// Configuración de CORS
app.use(cors({
  origin: '*',
}));

app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transferRoutes = require('./routes/transferRoutes');
const userRoutes = require('./routes/userRoutes'); // Nueva ruta para el manejo de usuarios

// Montar rutas
app.use('/auth', authRoutes);
app.use('/payments', paymentRoutes);
app.use('/transfers', transferRoutes);
app.use('/users', userRoutes); // Montar la nueva ruta para el manejo de usuarios

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
