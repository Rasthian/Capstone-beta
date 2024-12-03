const express = require('express');


const router = express.Router();
const firestoreController = require('../controllers/firestoreController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/authMiddleware');


router.post('/login', firestoreController.login );
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
  });


router.post('/register', firestoreController.register );
router.post('/logout',firestoreController.logout);



// Route untuk 'topic'
router.get('/topic', firestoreController.getAllTopic);
router.get('/topic/:uid', firestoreController.getTopicByUid);  // Menggunakan parameter ID untuk mendapatkan topic berdasarkan ID
router.post('/topic', firestoreController.addTopic);
router.put('/topic/:id', firestoreController.updateTopic);    // Menggunakan parameter ID untuk memperbarui topic berdasarkan ID
router.delete('/topic/:id', firestoreController.deleteTopic); // Menggunakan parameter ID untuk menghapus topic berdasarkan ID

// Route untuk 'comment'
router.get('/comment', firestoreController.getAllComment);
router.get('/comment/:uid', firestoreController.getCommentByUid);          // Menggunakan parameter ID untuk mendapatkan comment berdasarkan ID
router.get('/comment/topic/:topic_id', firestoreController.getCommentByTopicId); // Menggunakan parameter article_id untuk mendapatkan komentar berdasarkan artikel
router.post('/comment', firestoreController.addComment);
router.put('/comment/:id', firestoreController.updateComment);    // Menggunakan parameter ID untuk memperbarui komentar berdasarkan ID
router.delete('/comment/:id', firestoreController.deleteComment); // Menggunakan parameter ID untuk menghapus komentar berdasarkan ID



router.get('/article', firestoreController.getAllArticle);
router.post('/article', upload.single('image_url'), firestoreController.addArticle);



module.exports = router;
