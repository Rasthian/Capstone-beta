const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Pastikan ini adalah file yang benar

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://subur-bangkit.firebasestorage.app', // Pastikan ini adalah bucket yang benar
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();
const specificDatabase = db.collection('projects').doc('subur-bangkit');
module.exports = { db, bucket, specificDatabase, auth };