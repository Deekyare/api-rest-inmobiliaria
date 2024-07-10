const express = require('express');
const cors = require('cors');
const app = express();
const router = require('./routes/index');

// Configuración de CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/', router);

// Definir el puerto
const port = process.env.PORT || 3000; // Usa el puerto del entorno o 3000 si no está definido

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
