// middlewares/multerUpload.js
const multer = require('multer');

// Menggunakan memoryStorage untuk menyimpan file di memori
const storage = multer.memoryStorage();

// Inisialisasi multer
const upload = multer({ storage: storage });

// Ekspor middleware upload
module.exports = upload;