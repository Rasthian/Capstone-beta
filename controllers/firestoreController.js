const {
  db
} = require('../config/firebase');
const admin = require('firebase-admin');
const storageController = require('./storageController');
const axios = require('axios');
const dotenv = require('dotenv');
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
    if (data.topic.length > 255) {
      return res.status(400).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Topic exceeds maximum length of 255 characters.'
      });
    }
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('topics').add(data);
    res.status(201).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        id: docRef.id,
        message: 'Topics added successfully!'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
};

exports.getTopicByUid = async (req, res) => {
  try {
    const {
      uid
    } = req.params;
    const snapshot = await db.collection('topics').where('account_id', '==', uid).get();

    if (snapshot.empty) {
      return res.status(404).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'No topics found for this account'
      });
    }

    const topics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        topics: topics
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
};


exports.deleteTopic = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const doc = await db.collection('topics').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found",
        error: {
          code: 404,
          details: `No topic found with id: ${id}`
        }
      });
    }

    await db.collection('topics').doc(id).delete();

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
    } = req.params;
    const data = req.body;

    // Validasi panjang data
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

    data.topic_date = admin.firestore.FieldValue.serverTimestamp();
    const doc = await db.collection('topics').doc(id).get();

    // Validasi keberadaan dokumen
    if (!doc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found",
        error: {
          code: 404,
          details: `No topic found with id: ${id}`
        }
      });
    }

    // Update dokumen
    await db.collection('topics').doc(id).update(data);

    res.status(200).json({
      status: "success",
      message: "Topic updated successfully",
      data: {
        id: id,
        updatedFields: data
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
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
exports.addArticle = async (req, res) => {
  try {
    const data = req.body;

    // Validasi panjang deskripsi
    if (data.short_description.length > 255) {
      return res.status(400).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Article exceeds maximum length of 255 characters.'
      });
    }

    // Validasi keberadaan file gambar
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Image file is required.'
      });
    }

    // Upload gambar dan simpan URL
    const imageUrl = await storageController.uploadImageToFirebase(imageFile);
    data.image_url = imageUrl;

    // Menambahkan timestamp
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();

    // Menambahkan artikel ke database
    const docRef = await db.collection('article').add(data);
    res.status(201).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        id: docRef.id,
        message: 'Article added successfully!'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
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

exports.getAllComment = async (req, res) => {
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


// Mengambil komentar berdasarkan article_id
exports.getCommentByTopicId = async (req, res) => {
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
    } = req.params;
    const snapshot = await db.collection('comment').where('account_id', '==', uid).get();

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
        user_id: uid,
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
// Memperbarui komentar
exports.updateComment = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const data = req.body;

    // Validasi panjang komentar
    if (data.comment && data.comment.length > 255) {
      return res.status(400).json({
        status: "error",
        message: "Comment exceeds maximum length of 255 characters.",
        error: {
          code: 400,
          details: "Comment text must be less than or equal to 255 characters."
        }
      });
    }

    // Mengambil komentar berdasarkan ID
    const doc = await db.collection('comment').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
        error: {
          code: 404,
          details: `No comment found with id: ${id}`
        }
      });
    }

    // Menambahkan tanggal komentar dan memperbarui data
    data.comment_date = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('comment').doc(id).update(data);

    // Mengirim respons sukses
    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      data: {
        id,
        ...data
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update comment",
      error: {
        code: 500,
        details: error.message
      }
    });
  }

};
// Menghapus komentar
exports.deleteComment = async (req, res) => {
  try {
    const {
      id
    } = req.params; // Mengambil parameter ID dari URL
    const doc = await db.collection('comment').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
        error: {
          code: 404,
          details: `No comment found with id: ${id}`
        }
      });
    }

    // Menghapus komentar
    await db.collection('comment').doc(id).delete();

    // Mengirim respons sukses
    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
      data: {
        id
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete comment",
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
  },






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

  }

exports.register = async (req, res) => {
  const { email, password, displayName } = req.body;

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
  
}