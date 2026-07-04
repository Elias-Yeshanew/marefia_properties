const multer = require('multer');

// Configure Multer to use memory storage.
// This means the file will be stored in a Buffer in memory,
// which is suitable when directly streaming the file to a cloud service like Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        // Check file type to ensure it's an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept file
        } else {
            cb(new Error('Only image files are allowed!'), false); // Reject file
        }
    },
});

module.exports = upload;