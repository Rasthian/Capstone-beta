const admin = require('../config/firebase'); // Import konfigurasi Firebase Admin

const getUserFromDatabase = async (email) => {
  const userRef = admin.firestore().collection('accounts'); // Ganti 'users' dengan nama koleksi Anda
  const querySnapshot = await userRef.where('email', '==', email).get();

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data();
};

module.exports = { getUserFromDatabase };
