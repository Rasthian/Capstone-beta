const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: No token provided',
    });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verifikasi token
    const decodedToken = await admin.auth().verifyIdToken(idToken, true); // true memaksa token di-revoke jika revoked
    const user = await admin.auth().getUser(decodedToken.uid);

    // Periksa apakah token dikeluarkan sebelum waktu revocation
    const revokeTime = new Date(user.tokensValidAfterTime).getTime() / 1000;
    if (decodedToken.auth_time < revokeTime) {
      return res.status(401).json({
        status: 'error',
        message: 'Token revoked. Please login again.',
      });
    }

    // Token valid, lanjutkan ke middleware berikutnya
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Menangani kesalahan secara spesifik
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token format.',
      });
    }

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or expired token',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
