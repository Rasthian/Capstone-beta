const express = require('express');


const router = express.Router();
const firestoreController = require('../controllers/firestoreController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('../middleware/authMiddleware');


router.post('/login', firestoreController.login );
router.put('/profile/:uid', upload.single('imageProfile'), firestoreController.editProfile);
router.post('/register', firestoreController.register );
router.post('/logout',firestoreController.logout);



// Route untuk 'topic'
router.get('/topic',authMiddleware, firestoreController.getAllTopic);
router.get('/topic/:id', authMiddleware, firestoreController.getTopicById); // Rute dengan ID
router.get('/topic/user/:uid', authMiddleware, firestoreController.getTopicByUid);
router.post('/topic',authMiddleware, firestoreController.addTopic);
router.put('/topic/:id',authMiddleware, firestoreController.updateTopic);    // Menggunakan parameter ID untuk memperbarui topic berdasarkan ID
router.delete('/topic/:id',authMiddleware, firestoreController.deleteTopic); // Menggunakan parameter ID untuk menghapus topic berdasarkan ID

// Route untuk 'comment'
router.get('/comment',authMiddleware, firestoreController.getAllComment);
router.get('/comment/user/:uid',authMiddleware, firestoreController.getCommentByUid);          // Menggunakan parameter ID untuk mendapatkan comment berdasarkan ID
router.get('/comment/topic/:topic_id',authMiddleware, firestoreController.getCommentByTopicId); // Menggunakan parameter article_id untuk mendapatkan komentar berdasarkan artikel
router.post('/comment',authMiddleware, firestoreController.addComment);
router.put('/comment/:id',authMiddleware, firestoreController.updateComment);    // Menggunakan parameter ID untuk memperbarui komentar berdasarkan ID
router.delete('/comment/:id',authMiddleware, firestoreController.deleteComment); // Menggunakan parameter ID untuk menghapus komentar berdasarkan ID

router.delete('/prediction/:uid',authMiddleware, firestoreController.deleteComment);

router.get('/article', firestoreController.getAllArticle);
router.post('/article', upload.single('image_url'), firestoreController.addArticle);



module.exports = router;
