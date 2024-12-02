const { bucket } = require('../config/firebase');

// Upload file ke Firebase Storage
exports.uploadFile = async (req, res) => {
  try {
    const userId = req.user.uid; // ID pengguna dari token, jika menggunakan otentikasi
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Tentukan path file
    const filePath = `user-files/${userId}/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(filePath);

    // Buat stream untuk upload
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Event selesai upload
    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).json({ message: 'File uploaded successfully', publicUrl });
    });

    // Event error
    blobStream.on('error', (err) => {
      res.status(500).json({ message: err.message });
    });

    // Akhiri stream
    blobStream.end(file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
