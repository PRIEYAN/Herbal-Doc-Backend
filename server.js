const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = "mongodb+srv://mnprieyan:p2r7i7e2y00n7@cluster0.ogwyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
if (mongoURL) {
    mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Connected to MongoDB Atlas");
    }).catch((err) => {
        console.error("MongoDB Atlas connection error:", err);
    });
} else {
    console.error("MONGOURL environment variable is not set");
}


const consumerAuth = require('./consumer-services/auth-service/auth');
const consumerMedmeet = require('./consumer-services/core-services/medmeet');
const consumerHerbDocAi = require('./consumer-services/core-services/herbDocAi');
const doctorAuth = require('./doctor-services/auth-services/auth');
const doctorPfp = require('./doctor-services/auth-services/pfp');
const doctorPatientReq = require('./doctor-services/core-services/patientReq');

const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

app.use('/consumer/auth', consumerAuth);
app.use('/consumer/medmeet', consumerMedmeet);
app.use('/consumer/herbDocAi', consumerHerbDocAi);
app.use('/doctor/auth', doctorAuth);
app.use('/doctor/pfp', doctorPfp);
app.use('/doctor/patientReq', doctorPatientReq);
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
http://localhost:5001/consumer/medmeet/fixAppointment
http://localhost:5001/consumer/medmeet/history
http://localhost:5001/consumer/medmeet/getDoctors
http://localhost:5001/consumer/herbDocAi/generate





doctor services
http://localhost:5001/doctor/auth/signup 
http://localhost:5001/doctor/auth/login
http://localhost:5001/doctor/auth/jwt
http://localhost:5001/doctor/pfp/upload

http://localhost:5001/doctor/patientReq/getPatientReq
http://localhost:5001/doctor/patientReq/acceptPatientReq

*/