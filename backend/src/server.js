
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ClinicFlow API démarrée sur http://localhost:${PORT}`);
});
