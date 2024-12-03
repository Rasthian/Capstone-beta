const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verifikasi token
    const decodedToken = await admin.auth().verifyIdToken(idToken, true); // true memaksa token di-revoke jika revoked
    const user = await admin.auth().getUser(decodedToken.uid);

    // Periksa apakah token dikeluarkan sebelum waktu revocation
    const revokeTime = new Date(user.tokensValidAfterTime).getTime() / 1000;
    if (decodedToken.auth_time < revokeTime) {
      return res.status(401).json({ error: 'Token revoked. Please login again.' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};


module.exports = authMiddleware;
