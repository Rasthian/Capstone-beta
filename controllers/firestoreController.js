const { db } = require('../config/firebase');
const admin = require('firebase-admin');



exports.getAllTopic = async (req, res) => {
  try {
    const snapshot = await db.collection('topics').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: 'Invalid data format. Data must contain only account_id and topic as strings.' });
    }
  
    if (data.topic.length > 255) {
      return res.status(400).json({ message: 'Topic exceeds maximum length of 255 characters.' });
    }
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('topics').add(data);
    res.status(201).json({ id: docRef.id, message: 'topics added successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopicByUid = async (req, res) => {
  try {
    const { uid } = req.params; 
    const snapshot = await db.collection('topics').where('account_id', '==', uid).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No topics found for this account' });
    }

    const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('topics').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    await db.collection('topics').doc(id).delete();
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;


    if (data.topic && data.topic.length > 255) {
      return res.status(400).json({ message: 'Topic exceeds maximum length of 255 characters.' });
    }
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();
    const doc = await db.collection('topics').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    await db.collection('topics').doc(id).update(data);
    res.status(200).json({ message: 'Topic updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getAllArticle = async (req, res) => {
  try {
    const snapshot = await db.collection('article').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addArticle = async (req, res) => {
  try {
    
    const data = req.body;
    if (
      typeof data.article_link !== 'string' || 
      typeof data.image_url !== 'string' || 
      typeof data.short_description !== 'string' || 
      typeof data.title !== 'string' || 
      Object.keys(data).length !== 4
    ) {
      return res.status(400).json({ message: 'Invalid data format. Data must contain only account_id and topic as strings.' });
    }
  
    if (data.topic.length > 255) {
      return res.status(400).json({ message: 'article exceeds maximum length of 255 characters.' });
    }
    data.topic_date = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('article').add(data);
    res.status(201).json({ id: docRef.id, message: 'article added successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addComment = async (req, res) => {
  try {
    
    const data = req.body;
    if (
      typeof data.account_id !== 'string' || 
      typeof data.topic_id !== 'string' || 
      typeof data.comment !== 'string'||
      Object.keys(data).length !== 3
    ) {
      return res.status(400).json({ message: 'Invalid data format. data must have string format' });
    }
  
    if (data.comment.length > 255) {
      return res.status(400).json({ message: 'comment exceeds maximum length of 255 characters.' });
    }
    data.comment_date = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('comment').add(data);
    res.status(201).json({ id: docRef.id, message: 'comment added successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllComment = async (req, res) => {
  try {
    const snapshot = await db.collection('comment').get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Mengambil komentar berdasarkan article_id
exports.getCommentByTopicId = async (req, res) => {
  try {
    const { topic_id } = req.params;
    const snapshot = await db.collection('comment').where('topic_id', '==', topic_id).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No comments found for this topic' });
    }

    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCommentByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const snapshot = await db.collection('comment').where('account_id', '==', uid).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No comment found for the given uid' });
    }
    
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Memperbarui komentar
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const data = req.body;
    if (data.comment && data.comment.length > 255) {
      return res.status(400).json({ message: 'Comment exceeds maximum length of 255 characters.' });
    }

    const doc = await db.collection('comment').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    data.comment_date = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('comment').doc(id).update(data);
    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Menghapus komentar
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil parameter UID dari URL
    const doc = await db.collection('comment').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Menghapus komentar
    await db.collection('comment').doc(id).delete();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







//AUTH
exports.login =  async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autentikasi pengguna menggunakan Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Jika user ditemukan, kita bisa mengeluarkan token
    const token = await admin.auth().createCustomToken(userRecord.uid);
    
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}



exports.logout = async (req, res) => {
  const { uid } = req.body; 

  try {
      await admin.auth().revokeRefreshTokens(uid);

      res.status(200).json({ message: 'User logged out and tokens revoked successfully' });
  } catch (error) {
      console.error('Error during token revocation:', error);
      res.status(500).json({ message: 'Logout failed', error });
  }
};

exports.register = async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
      const userRecord = await admin.auth().createUser ({
          email,
          password,
          displayName,
      });

      await admin.firestore().collection('accounts').doc(userRecord.uid).set({
          email,
          displayName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({ message: 'User  registered successfully', uid: userRecord.uid });
  } catch (error) {
      res.status(400).send('Error registering user: ' + error.message);
  }
}


