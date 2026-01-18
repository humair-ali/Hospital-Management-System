const express = require('express');
const router = express.Router();
const multer = require('multer');

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
    limits: {
        fileSize: 4 * 1024 * 1024 // 4MB limit
    }
});

router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Convert buffer to Base64 Data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            url: dataURI // Return Base64 string as URL
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});

module.exports = router;