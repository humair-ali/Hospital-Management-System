const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Vercel Read-Only Fix: Use Memory Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit for DB storage safety
});

async function ensureProfileImageColumn() {
  try {
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_image'
    `);

    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE users ADD COLUMN profile_image LONGTEXT NULL AFTER phone
      `);
      console.log('✅ Added profile_image column (LONGTEXT) to users table');
    } else if (columns[0].DATA_TYPE !== 'longtext' && columns[0].DATA_TYPE !== 'mediumtext') {
      // Automatic migration to LONGTEXT for existing columns to support Base64
      // We use MODIFY to change the type
      await pool.query(`
        ALTER TABLE users MODIFY COLUMN profile_image LONGTEXT NULL
      `);
      console.log('✅ Migrated profile_image column to LONGTEXT for Base64 storage');
    }
  } catch (err) {
    console.error('Error checking/adding profile_image column:', err.message);
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

router.post('/upload-image', verifyToken, upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    await ensureProfileImageColumn();
    const userId = req.user.id;

    // Convert buffer to Base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [dataURI, userId]);

    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.profile_image, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      url: dataURI,
      user: users[0]
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/update-profile-image', verifyToken, async (req, res) => {
  try {
    await ensureProfileImageColumn();
    const userId = req.user.id;
    const { profile_image } = req.body;

    if (!profile_image) {
      return res.status(400).json({ success: false, error: 'Profile image URL is required' });
    }

    // Check if it's a huge payload (Base64)
    if (profile_image.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'Image too large' });
    }

    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [profile_image, userId]);

    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.profile_image, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/update', verifyToken, upload.single('profile_image'), async (req, res) => {
  try {
    await ensureProfileImageColumn();
    const userId = req.user.id;
    let imageUrl = req.body.profile_image;

    if (req.file) {
      // Vercel Fix: Use Base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);

    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.profile_image, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      imageUrl: imageUrl,
      user: users[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;