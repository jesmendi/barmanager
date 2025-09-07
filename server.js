const express = require('express');
const cors = require('cors');
const orderRoutes = require('./app/routes/orderRoutes');
const simpleLogger = require('./app/middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(simpleLogger);

app.use('/api', orderRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

// SOLO iniciar el servidor si NO estamos corriendo tests
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
}

// exportamos la app para tests
module.exports = app;
