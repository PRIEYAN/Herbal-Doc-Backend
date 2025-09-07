const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const { type } = require('os');
require('dotenv').config();

// MongoDB connection
const mongoURL = process.env.MONGOURL;
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

function randomAppoId() {
    const chars = '0123456789';
    let id = 'AP';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

const appointmentSchema = new mongoose.Schema({
    appointmentId : {type:String,default:randomAppoId()},
    doctorName:{type:String,require},
    doctorPhoneNumber:{type:String},
    patientName:{type:String},
    patientPhoneNumber:{type:String},
    status:{type:String,default:"pending"},
    reqTime:{type:String},
    acceptTime:{type:String}
}, { collection: "appointmentSchema" });

const appointment = mongoose.model('appointmentlogs', appointmentSchema);

module.exports = appointment;