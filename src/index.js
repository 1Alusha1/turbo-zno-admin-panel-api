const express = require('express');
const mongoose = require('mongoose');
const auth = require('./routes/auth.route');
const option = require('./routes/option.route');
const telegram = require('./routes/telegram.route');
const cors = require('cors');
require('dotenv').config();
const app = express();

const corsOption = {
  origin: process.env.DOMAIN,
};

app.use(cors(corsOption));
app.use(express.json());
app.use('/auth', auth);
app.use('/option', option);
app.use('/telegram-api', telegram);
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true }, (err) => {
  if (err) console.log(err);
  app.listen(process.env.PORT, () =>
    console.log(`Server started on port=${process.env.PORT}`)
  );
});
