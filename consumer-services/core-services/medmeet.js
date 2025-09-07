const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../database/connect');
const mongoose = require("mongoose");
require('dotenv').config();
require('../../database/logsMongo');

const appointment = mongoose.model('appointmentlogs');


router.use(cors());
const jwtsecret = process.env.JWTSECRET;

router.get('/', (req, res) => {
    return res.status(200).json({message: 'consumer core-services medmeet'});
});

router.get('/getDoctors', async (req, res) => {
    try{
        const doctorsResult = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, rating FROM doctors');
        const booked = await appointment.find({patientName: {$ne: null}});
        
        let availableDoctors;
        if(booked.length > 0){
            const bookedDoctors = booked.map(appointment => appointment.doctorName);
            availableDoctors = doctorsResult.rows.filter(doctor => !bookedDoctors.includes(doctor.name));
        }else{
            availableDoctors = doctorsResult.rows;
        }       
        
        res.status(200).json({doctors: availableDoctors});
    }catch(error){
        console.error('Error fetching doctors:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});
router.post('/getDoctorDetails/:id', async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const {id} = req.params;
        const doctor = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, profile_pic, rating FROM doctors WHERE sno = $1', [id]);
        res.status(200).json({doctor: doctor.rows[0]});
    }catch(error){
        console.error('Error fetching doctor details:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});
 
router.post('/fixAppointment', async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        
        const {doctorId, date, time} = req.body;
        const patientId = decoded.id;
        
        // Fetch doctor details
        const doctor = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, profile_pic, rating FROM doctors WHERE sno = $1', [doctorId]);
        
        if(doctor.rows.length === 0){
            return res.status(404).json({message: 'Doctor not found'});
        }
        
        const doctorData = doctor.rows[0];
        const booked = doctorData.booked;
        
        // Fetch patient details
        const patient = await pool.query('SELECT name, phonenumber FROM consumers WHERE sno = $1', [patientId]);
        
        if(patient.rows.length === 0){
            return res.status(404).json({message: 'Patient not found'});
        }
        
        const patientData = patient.rows[0];
        
        if(booked === 'none'||booked === 'requested'){
            // Create new appointment in MongoDB
            const newRequest = new appointment({
                doctorName: doctorData.name,
                doctorPhoneNumber: doctorData.phonenumber,
                patientName: patientData.name,
                patientPhoneNumber: patientData.phonenumber,
                status: "pending",
                reqTime: `${date} ${time}`,
                acceptTime: null
            });
            
            await newRequest.save();
            
            // Update doctor's booked status
            const updateBooked = await pool.query(
                'UPDATE doctors SET booked = $1 WHERE sno = $2', 
                [`requested`, doctorId]
            );
            
            res.status(200).json({
                message: 'Appointment fixed successfully',
                appointmentId: newRequest.appointmentId
            });
        }else{
            res.status(400).json({message: 'Doctor is already booked'});
        }
    }catch(error){
        console.error('Error fixing appointment:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/history', async (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        
        // Get patient details from database using the ID from JWT
        const patient = await pool.query('SELECT name FROM consumers WHERE sno = $1', [decoded.id]);
        if(patient.rows.length === 0){
            return res.status(404).json({message: 'Patient not found'});
        }
        
        const patientName = patient.rows[0].name;
        const history = await appointment.find({patientName: patientName});
        res.status(200).json({history: history});
    }catch(error){
        console.error('Error fetching history:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});


module.exports = router;