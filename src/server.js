require('dotenv').config();
const app = require('./formativa');

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor SaborDigital rodando na porta ${PORT}`);
});