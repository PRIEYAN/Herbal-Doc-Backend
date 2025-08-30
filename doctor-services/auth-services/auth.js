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
    return res.status(200).json({message: 'doctor auth-services'});
});

router.post('/signup', async (req, res) => {
    try {
        const {name, email, phonenumber, nmr_number, password, hospital, specialization, aboutme} = req.body;
        
        // Validate required fields
        if (!name || !email || !phonenumber || !nmr_number || !password || !hospital || !specialization || !aboutme) {
            return res.status(400).json({message: 'All fields are required'});
        }

        // Check for existing doctor by phone number
        const existingDoctorByPhone = await pool.query('SELECT * FROM doctors WHERE phonenumber = $1', [phonenumber]);
        if (existingDoctorByPhone.rows.length > 0) {
            return res.status(400).json({message: 'Phone number already exists'});
        }

        // Check for existing doctor by NMR number
        const existingDoctorByNMR = await pool.query('SELECT * FROM doctors WHERE nmr_number = $1', [nmr_number]);
        if (existingDoctorByNMR.rows.length > 0) {
            return res.status(400).json({message: 'NMR number already exists'});
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new doctor
        const insertQuery = `
            INSERT INTO doctors (name, email, phonenumber, nmr_number, password, hospital, specialization, aboutme)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING sno, name, email, phonenumber, nmr_number, hospital, specialization
        `;
        
        const result = await pool.query(insertQuery, [
            name, email, phonenumber, nmr_number, hashedPassword, hospital, specialization, aboutme
        ]);

        const doctor = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: doctor.sno, 
                email: doctor.email, 
                role: 'doctor' 
            }, 
            jwtsecret, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Doctor registered successfully',
            token,
            doctor: {
                id: doctor.sno,
                name: doctor.name,
                email: doctor.email,
                phonenumber: doctor.phonenumber,
                nmr_number: doctor.nmr_number,
                hospital: doctor.hospital,
                specialization: doctor.specialization
            }
        });

    } catch (error) {
        console.error('Doctor signup error:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({message: 'Email and password are required'});
        }

        // Find doctor by email
        const result = await pool.query('SELECT * FROM doctors WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const doctor = result.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, doctor.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: doctor.sno, 
                email: doctor.email, 
                role: 'doctor' 
            }, 
            jwtsecret, 
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            doctor: {
                id: doctor.sno,
                name: doctor.name,
                email: doctor.email,
                phonenumber: doctor.phonenumber,
                nmr_number: doctor.nmr_number,
                hospital: doctor.hospital,
                specialization: doctor.specialization
            }
        });

    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;  