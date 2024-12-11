const {
  db
} = require('../config/firebase');
const admin = require('firebase-admin');
const storageController = require('./storageController');
const axios = require('axios');


exports.getAllTopic = async (req, res) => {
  try {
    const snapshot = await db.collection('topics').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      status: "success",
      message: "Topics retrieved successfully",
      data: documents,
      meta: {
        count: documents.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve topics",
      error: {
        code: 500,
        details: error.message
      }
    });
  }

};
exports.addTopic = async (req, res) => {
  try {
    const data = req.body;

    if (
      typeof data.account_id !== 'string' ||
      typeof data.topic !== 'string' ||
      Object.keys(data).length !== 2
    ) {
      return res.status(400).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Invalid data format. Data must contain only account_id and topic as strings.'
      });
    }

    // Validasi panjang topic
    if (data.topic.length > 255) {
      return res.status(400).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Topic exceeds maximum length of 255 characters.'
      });
    }

    // Pastikan account_id sesuai dengan UID user yang terautentikasi
    if (data.account_id !== req.user.uid) {
      return res.status(403).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Access denied. You can only add topics for your own account.'
      });
    }

    // Tambahkan timestamp
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();

    // Simpan data ke Firestore
    const docRef = await db.collection('topics').add(data);

    // Respon sukses
    res.status(201).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        id: docRef.id,
        message: 'Topic added successfully!'
      }
    });
  } catch (error) {
    console.error('Error in addTopic:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
};
exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params; // ID topik dari parameter URL
    const snapshot = await db.collection('topics').doc(id).get();

    // Validasi jika topik tidak ditemukan
    if (!snapshot.exists) {
      return res.status(404).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Topic not found',
      });
    }

    const topic = snapshot.data();

    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        id,
        topic,
      },
    });
  } catch (error) {
    console.error('Error in getTopicById:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message,
    });
  }
};
exports.getTopicByUid = async (req, res) => {
  try {
    const {
      uid
    } = req.params; // UID dari parameter URL

    // Query untuk mengambil topik berdasarkan UID
    const snapshot = await db.collection('topics').where('account_id', '==', uid).get();

    // Validasi jika tidak ada data
    if (snapshot.empty) {
      return res.status(404).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'No topics found for this account',
      });
    }

    // Format data dari snapshot
    const topics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Kirimkan respons sukses
    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        topics,
      },
    });
  } catch (error) {
    console.error('Error in getTopicByUid:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message,
    });
  }
};
exports.deleteTopic = async (req, res) => {
  try {
    const {
      id
    } = req.params; // Mendapatkan ID dari parameter URL
    const authenticatedUid = req.user.uid; // UID dari pengguna yang terautentikasi

    // Ambil dokumen topik berdasarkan ID
    const topicRef = db.collection('topics').doc(id);
    const topicDoc = await topicRef.get();

    // Validasi keberadaan dokumen
    if (!topicDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found",
        error: {
          code: 404,
          details: `No topic found with id: ${id}`
        }
      });
    }

    // Validasi kepemilikan dokumen
    const topicData = topicDoc.data();
    if (topicData.account_id !== authenticatedUid) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only delete your own topics.",
        error: {
          code: 403,
          details: "User is not authorized to delete this topic."
        }
      });
    }

    // Hapus dokumen
    await topicRef.delete();

    // Kirimkan respons sukses
    res.status(200).json({
      status: "success",
      message: "Topic deleted successfully",
      data: {
        id: id
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in deleteTopic:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete topic",
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};
exports.updateTopic = async (req, res) => {
  try {
    const {
      id
    } = req.params; // Mendapatkan ID dari parameter URL
    const authenticatedUid = req.user.uid; // UID dari user yang terautentikasi
    const data = req.body; // Data yang dikirimkan dari request body

    // Validasi panjang `topic`
    if (data.topic && data.topic.length > 255) {
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        error: {
          code: 400,
          details: "Topic exceeds maximum length of 255 characters."
        }
      });
    }

    // Ambil dokumen topik berdasarkan ID
    const topicRef = db.collection('topics').doc(id);
    const topicDoc = await topicRef.get();

    // Validasi keberadaan dokumen
    if (!topicDoc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found",
        error: {
          code: 404,
          details: `No topic found with id: ${id}`
        }
      });
    }

    // Validasi kepemilikan dokumen (hanya pemilik yang boleh mengedit)
    const topicData = topicDoc.data();
    if (topicData.account_id !== authenticatedUid) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only update your own topics.",
        error: {
          code: 403,
          details: "User is not authorized to update this topic."
        }
      });
    }

    // Tambahkan timestamp untuk pembaruan
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();

    // Perbarui dokumen
    await topicRef.update(data);

    // Kirimkan respons sukses
    res.status(200).json({
      status: "success",
      message: "Topic updated successfully",
      data: {
        id: id
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in updateTopic:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to update topic",
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};



exports.getAllArticle = async (req, res) => {
  try {
    const snapshot = await db.collection('article').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      status: "success",
      message: "Articles retrieved successfully",
      data: documents,
      meta: {
        count: documents.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve articles",
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};


exports.addComment = async (req, res) => {
  try {
    const data = req.body;

    // Validasi format data
    if (
      typeof data.account_id !== 'string' ||
      typeof data.topic_id !== 'string' ||
      typeof data.comment !== 'string' ||
      Object.keys(data).length !== 3
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid data format",
        error: {
          code: 400,
          details: "Data must contain exactly 3 string fields: account_id, topic_id, and comment."
        }
      });
    }

    // Validasi panjang komentar
    if (data.comment.length > 255) {
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        error: {
          code: 400,
          details: "Comment exceeds maximum length of 255 characters."
        }
      });
    }
    if (data.account_id !== req.user.uid) {
      return res.status(403).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Access denied. You can only add topics for your own account.'
      });
    }
    data.comment_date = admin.firestore.FieldValue.serverTimestamp();

    // Menambahkan data ke Firestore
    const docRef = await db.collection('comment').add(data);

    res.status(201).json({
      status: "success",
      message: "Comment added successfully",
      data: {
        id: docRef.id,
        ...data
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to add comment",
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};
exports.getAllComment = async ( req, res) => {
  try {
    const snapshot = await db.collection('comment').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      status: "success",
      message: "Comments retrieved successfully",
      data: documents,
      meta: {
        count: documents.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve comments",
      error: {
        code: 500,
        details: error.message
      }
    });
  }

};
exports.getCommentByTopicId = async ( req, res) => {
  try {

    const snapshot = await db.collection('comment').get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      status: "success",
      message: "Comments retrieved successfully",
      data: documents,
      meta: {
        count: documents.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve comments",
      error: {
        code: 500,
        details: error.message
      }
    });
  }

};
exports.getCommentByUid = async (req, res) => {
  try {
    const {
      uid
    } = req.params; // UID dari parameter URL

    const snapshot = await db.collection('comment').where('account_id', '==', uid).get();

    // Validasi jika tidak ada data
    if (snapshot.empty) {
      return res.status(404).json({
        status: "error",
        message: "No comments found for the given user ID",
        error: {
          code: 404,
          details: `No comments associated with account_id: ${uid}`
        }
      });
    }

    // Format data dari snapshot
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Kirimkan respons sukses
    res.status(200).json({
      status: "success",
      message: "Comments retrieved successfully",
      data: documents,
      meta: {
        count: documents.length,
        user_id: uid,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getCommentByUid:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve comments",
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};
exports.updateComment = async (req, res) => {
  try {
    const {
      id
    } = req.params; // ID komentar dari parameter URL
    const data = req.body; // Data pembaruan dari body request
    const authenticatedUid = req.user.uid; // UID user terautentikasi dari middleware

    // Validasi panjang komentar
    if (data.comment && data.comment.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment exceeds maximum length of 255 characters.',
        error: {
          code: 400,
          details: 'Comment text must be less than or equal to 255 characters.'
        }
      });
    }

    // Mengambil dokumen komentar berdasarkan ID
    const commentRef = db.collection('comment').doc(id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
        error: {
          code: 404,
          details: `No comment found with id: ${id}`
        }
      });
    }

    // Periksa apakah account_id dari dokumen cocok dengan UID user terautentikasi
    const commentData = commentDoc.data();
    if (commentData.account_id !== authenticatedUid) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own comments.',
        error: {
          code: 403,
          details: 'User is not authorized to update this comment.'
        }
      });
    }

    // Tambahkan timestamp pembaruan
    data.comment_date = admin.firestore.FieldValue.serverTimestamp();

    // Perbarui dokumen
    await commentRef.update(data);

    // Kirim respons sukses
    res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
      data: {
        id
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in updateComment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update comment',
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const {
      id
    } = req.params; // Mengambil parameter ID dari URL
    const authenticatedUid = req.user.uid; // UID user terautentikasi dari middleware

    // Mengambil dokumen komentar berdasarkan ID
    const commentRef = db.collection('comment').doc(id);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
        error: {
          code: 404,
          details: `No comment found with id: ${id}`
        }
      });
    }

    // Validasi kepemilikan komentar berdasarkan UID
    const commentData = commentDoc.data();
    if (commentData.account_id !== authenticatedUid) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own comments.',
        error: {
          code: 403,
          details: 'User is not authorized to delete this comment.'
        }
      });
    }

    // Menghapus komentar
    await commentRef.delete();

    // Mengirim respons sukses
    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
      data: {
        id
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment',
      error: {
        code: 500,
        details: error.message
      }
    });
  }
};


//AUTH
exports.login = async (req, res) => {
    const {
      email,
      password
    } = req.body;

    try {
      // Kirim request ke Firebase Authentication REST API
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
          email,
          password,
          returnSecureToken: true,
        }
      );

      const {
        idToken,
        localId
      } = response.data;

      // Dapatkan informasi pengguna menggunakan Admin SDK
      const userRecord = await admin.auth().getUser(localId);

      // Respons sukses dengan token dan biodata
      res.status(200).json({
        status: "success",
        message: "User authenticated successfully",
        data: {
          token: idToken, // Token untuk otentikasi sisi klien
          biodata: {
            uid: userRecord.uid,
            email: userRecord.email,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Tangani error dan beri respons yang lebih informatif
      console.error(error.message);
      res.status(401).json({
        status: "error",
        message: "Authentication failed",
        error: {
          code: 401,
          details: error.message || "Invalid credentials or server error",
        },
      });
    }
  };
exports.logout = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided',
        error: {
          code: 401,
          details: 'Authorization token is missing or malformed.',
        },
      });
    }

    const idToken = authHeader.split(' ')[1];

    try {
      // Decode token untuk mendapatkan UID pengguna
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Revoke semua token refresh dan access pengguna
      await admin.auth().revokeRefreshTokens(uid);

      // Respons sukses logout
      res.status(200).json({
        status: 'success',
        message: 'Logout successful. Token revoked.',
        data: {
          uid
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error revoking token:', error);

      // Respons error internal server
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: {
          code: 500,
          details: error.message || 'An unexpected error occurred.',
        },
      });
    }

  };
exports.register = async (req, res) => {
  const {
    email,
    password,
    displayName,
    imageProfile = null, // Default imageProfile ke null jika tidak ada
  } = req.body;

  // Validasi Password
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/; // Minimal 8 karakter, mengandung angka dan huruf kapital
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 8 characters long, contain a number, and an uppercase letter.',
    });
  }

  try {
    // Membuat pengguna di Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Menyimpan data pengguna di Firestore
    await admin.firestore().collection('accounts').doc(userRecord.uid).set({
      email,
      displayName,
      imageProfile, // Akan null jika tidak dikirim
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Respons sukses pendaftaran pengguna
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        imageProfile: imageProfile || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error registering user:', error.message);

    // Respons error pendaftaran pengguna
    res.status(400).json({
      status: 'error',
      message: 'Error registering user',
      error: {
        code: 400,
        details: error.message || 'An error occurred during user registration',
      },
    });
  }
};

exports.editProfile = async (req, res) => {
  const { uid } = req.params; // Ambil UID dari parameter URL
  const { displayName } = req.body; // Data yang akan di-update
  const imageFile = req.file; // Gambar yang diunggah
  const authHeader = req.headers.authorization; // Token dikirim di header Authorization

  try {
    // 1. Verifikasi token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided',
      });
    }

    const token = authHeader.split(' ')[1]; // Ambil token dari header
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.uid !== uid) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You are not allowed to edit this profile',
      });
    }

    // 2. Ambil data akun dari Firestore
    const accountRef = admin.firestore().collection('accounts').doc(uid);
    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found',
      });
    }

    const currentData = accountDoc.data();
    const updateData = {};

    // 3. Validasi input
    if (!displayName && !imageFile) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field (displayName or imageProfile) is required for update',
      });
    }

    // 4. Proses upload gambar jika ada
    if (imageFile) {
      let imageUrl;

      // Hapus gambar lama jika ada
      if (currentData.imageProfile) {
        const oldFileName = currentData.imageProfile.split('/').pop(); // Ambil nama file lama
        const bucket = admin.storage().bucket(); // Ambil bucket storage
        await bucket.file(oldFileName).delete(); // Hapus file lama dari Firebase Storage
        console.log(`Old file ${oldFileName} has been deleted.`);
      }

      // Unggah gambar baru
      imageUrl = await storageController.uploadImageToFirebase(imageFile);
      updateData.imageProfile = imageUrl;
    }

    // 5. Update displayName jika ada
    if (displayName) {
      updateData.displayName = displayName;

      // Update juga di Authentication Firebase
      await admin.auth().updateUser(uid, { displayName });
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // 6. Update data Firestore
    await accountRef.update(updateData);

    // 7. Respons sukses
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        uid,
        ...(displayName && { displayName }),
        ...(updateData.imageProfile && { imageProfile: updateData.imageProfile }),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating profile:', error.message);

    // Respons error
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      error: {
        code: 500,
        details: error.message || 'An error occurred while updating the profile',
      },
    });
  }
};