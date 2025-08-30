const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const consumerRouter = require('./consumer-services/auth-service/auth');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/consumer/auth', consumerRouter);


app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;