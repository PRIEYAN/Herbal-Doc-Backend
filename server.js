const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const consumerAuth = require('./consumer-services/auth-service/auth');
const consumerMedmeet = require('./consumer-services/core-services/medmeet');
const consumerHerbDocAi = require('./consumer-services/core-services/herbDocAi');
const doctorAuth = require('./doctor-services/auth-services/auth');
const doctorPfp = require('./doctor-services/auth-services/pfp');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/consumer/auth', consumerAuth);
app.use('/consumer/medmeet', consumerMedmeet);
app.use('/consumer/herbDocAi', consumerHerbDocAi);
app.use('/doctor/auth', doctorAuth);
app.use('/doctor/pfp', doctorPfp);

app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

/*
consumer services
http://localhost:5001/consumer/auth/signup
http://localhost:5001/consumer/auth/login
http://localhost:5001/consumer/auth/jwt

http://localhost:5001/consumer/medmeet/getDoctors
http://localhost:5001/consumer/herbDocAi/generate





doctor services
http://localhost:5001/doctor/auth/signup 
http://localhost:5001/doctor/auth/login
http://localhost:5001/doctor/auth/jwt
http://localhost:5001/doctor/pfp/upload

*/