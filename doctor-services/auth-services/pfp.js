const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const pool = require('../../database/connect');
require('dotenv').config();

router.use(cors());
const jwtsecret = process.env.JWTSECRET;

// Configure multer for memory storage to get buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.get('/', (req, res) => {
    return res.status(200).json({message: 'doctor pfp-services'});
});

router.post('/upload', upload.single('profile_pic'), async(req, res) => {
    try{
        // Get token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({message: 'Authorization header missing'});
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({message: 'Token missing'});
        }

        // Verify JWT token
        const decoded = jwt.verify(token, jwtsecret);
        if (!decoded) {
            return res.status(401).json({message: 'Invalid token'});
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({message: 'Profile picture file is required'});
        }

        // Get the buffer from the uploaded file
        const imageBuffer = req.file.buffer;

        // Update the profile picture in database
        const pfpUpdate = await pool.query(
            'UPDATE doctors SET profile_pic = $1 WHERE sno = $2', 
            [imageBuffer, decoded.id]
        );

        if (pfpUpdate.rowCount === 0) {
            return res.status(400).json({message: 'Failed to update profile picture'});
        }

        return res.status(200).json({
            message: 'Profile picture updated successfully',
            fileSize: imageBuffer.length,
            fileName: req.file.originalname
        });
    } catch(error) {
        console.error('Error updating profile picture:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

router.get('/profile/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Get the profile picture from database
        const result = await pool.query(
            'SELECT profile_pic FROM doctors WHERE sno = $1', 
            [doctorId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: 'Doctor not found'});
        }
        
        const profilePic = result.rows[0].profile_pic;
        
        if (!profilePic) {
            return res.status(404).json({message: 'Profile picture not found'});
        }
        
        // Set appropriate headers for image
        res.setHeader('Content-Type', 'image/jpeg'); // You might want to store the mime type separately
        res.setHeader('Content-Length', profilePic.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Send the image buffer
        res.send(profilePic);
        
    } catch(error) {
        console.error('Error retrieving profile picture:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;  