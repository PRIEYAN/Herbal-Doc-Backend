const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../database/connect');
require('dotenv').config();

router.use(cors());
const jwtsecret = process.env.JWTSECRET;

router.get('/', (req, res) => {
    return res.status(200).json({message: 'consumer core-services medmeet'});
});

router.get('/getDoctors', async (req, res) => {
    try{
        const doctors = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, rating FROM doctors');
        res.status(200).json({doctors: doctors.rows});
    }catch(error){
        console.error('Error fetching doctors:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});
router.post('/getDoctorDetails/:id', async (req, res) => {
    try{
        const jwt = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(jwt, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const {id} = req.params;
        const doctor = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, profile_pic, rating FROM doctors WHERE id = $1', [id]);
        res.status(200).json({doctor: doctor.rows[0]});
    }catch(error){
        console.error('Error fetching doctor details:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});
 
router.post('/fixAppointment', async (req, res) => {
    try{
        const jwt = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(jwt, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const {doctorId, date, time} = req.body;
        const doctor = await pool.query('SELECT sno, name, email, phonenumber, nmr_number, hospital, specialization, aboutme, booked, bookedby, profile_pic, rating FROM doctors WHERE id = $1', [doctorId]);
        const booked = doctor.rows[0].booked;
        if(booked === 'none'){
            const updateBooked = await pool.query(
                'UPDATE doctors SET booked = $1 WHERE id = $2', 
                [`${date} ${time}`, doctorId]
            );
            const updateBookedBy = await pool.query(
                'UPDATE doctors SET bookedby = $1 WHERE id = $2', 
                [decoded.id, doctorId]
            );
            res.status(200).json({message: 'Appointment fixed successfully'});
        }else{
            res.status(400).json({message: 'Doctor is already booked'});
        }
    }catch(error){
        console.error('Error fixing appointment:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});


module.exports = router;