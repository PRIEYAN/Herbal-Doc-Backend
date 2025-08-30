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

router.post('/getDoctors', async (req, res) => {
    try{
        const jwt = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(jwt, jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const doctors = await pool.query('SELECT * FROM doctors');
        res.status(200).json({doctors: doctors.rows});
    }catch(error){
        console.error('Error fetching doctors:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});



module.exports = router;