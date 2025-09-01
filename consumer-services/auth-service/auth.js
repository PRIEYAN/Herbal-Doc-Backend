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
    return res.status(200).json({message: 'consumer auth-services'});
});

router.post('/signup', async (req, res) => {
    try{
        const{name,email,PhoneNumber,dob,password} = req.body;
        const existingConsumer = await pool.query('SELECT * FROM consumers WHERE email = $1', [email]);
        if(existingConsumer.rows.length > 0){
            return res.status(400).json({message: 'Email already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newConsumer = await pool.query('INSERT INTO consumers (name, email, phonenumber, dob, password) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, email, PhoneNumber, dob, hashedPassword]);
        const token = jwt.sign({ id: newConsumer.rows[0].sno, email: newConsumer.rows[0].email },jwtsecret, { expiresIn: '24h' });
        res.status(201).json({message:"registration successful", user: newConsumer.rows[0], token});
    } catch (error) {
        console.error('Error signing up consumer:', error);
        res.status(500).json({message: 'Internal server error'});
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const consumer = await pool.query('SELECT * FROM consumers WHERE email = $1', [email]);
        
        if (consumer.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, consumer.rows[0].password);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: consumer.rows[0].sno, email: consumer.rows[0].email },
            jwtsecret,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            message: 'Login successful',
            token,
            user: {
                sno: consumer.rows[0].sno,
                name: consumer.rows[0].name,
                email: consumer.rows[0].email,
                phonenumber: consumer.rows[0].phonenumber
            }
        });
    } catch (error) {
        console.error('Error logging in consumer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/jwt', async (req, res) => {
    try{
        const {token} = req.body;
        if(!token){
            return res.status(401).json({message: 'Token missing'});
        }
        const decoded=jwt.verify(token,jwtsecret);
        if(!decoded){
            return res.status(401).json({message: 'Invalid token'});
        }
        const consumer=await pool.query('SELECT * FROM consumers WHERE sno = $1',[decoded.id]);
        if(consumer.rows.length === 0){
            return res.status(401).json({message: 'Consumer not found'});
        }
        res.status(200).json({message: 'JWT verified', consumer: consumer.rows[0]});
    }catch(error){
        console.error('Error verifying JWT:', error);
        res.status(500).json({message: 'Internal server error'});
    }
})

module.exports = router;