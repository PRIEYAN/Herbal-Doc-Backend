const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const consumerAuth = require('./consumer-services/auth-service/auth');
const doctorAuth = require('./doctor-services/auth-services/auth');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/consumer/auth', consumerAuth);
app.use('/doctor/auth', doctorAuth);

app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

/*
consumer services
http://localhost:5001/consumer/auth/signup
http://localhost:5001/consumer/auth/login



doctor services
http://localhost:5001/doctor/auth/signup 
http://localhost:5001/doctor/auth/login

*/