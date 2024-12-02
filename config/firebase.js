const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Pastikan ini adalah file yang benar

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://submission-mgce-rasthian-restu.appspot.com', // Pastikan ini adalah bucket yang benar
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const specificDatabase = db.collection('projects').doc('submission-mgce-rasthian-restu');
module.exports = { db, bucket, specificDatabase };