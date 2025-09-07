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
router.use(express.json());
const jwtsecret = process.env.JWTSECRET;

router.get('/', (req, res) => {
    return res.status(200).json({message: 'doctor core-services patientReq'});
});


router.post('/getPatientReq', async (req, res) => {
    try{
        if (!req.body || !req.body.token) {
            return res.status(400).json({message: 'Token is required'});
        }
        
        const {token} = req.body;
        const decoded = jwt.verify(token, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const doctor = await pool.query('SELECT * FROM doctors WHERE sno = $1', [decoded.id]);
        if(!doctor){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const patientReq = await appointment.find({doctorName: doctor.rows[0].name});
        
        if (!patientReq || patientReq.length === 0) {
            return res.status(404).json({message: 'No patient requests found'});
        }
        
        return res.status(200).json({
            message: 'Patient requests retrieved successfully',
            data: patientReq
        });
    }
    catch(error){
        console.error('Error fetching patient requests:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/acceptPatientReq', async (req, res) => {
    try{
        const {appointmentId, token} = req.body;
        const decoded = jwt.verify(token, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const doctor = await pool.query('SELECT * FROM doctors WHERE sno = $1', [decoded.id]);
        if(!doctor){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const patientReq = await appointment.findOneAndUpdate({appointmentId: appointmentId}, {status: 'accepted', acceptTime: new Date().toISOString()});
        
        if (!patientReq) {
            return res.status(404).json({message: 'Appointment not found'});
        }
        
        const updateBooked = await pool.query('UPDATE doctors SET booked = $1 WHERE sno = $2', ['accepted', doctor.rows[0].sno]);
        if(!updateBooked){
            return res.status(400).json({message: 'Failed to update doctor booked status'});
        }
        
        return res.status(200).json({
            message: 'Patient request accepted successfully',
            data: patientReq
        });
    }
    catch(error){
        console.error('Error accepting patient request:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;