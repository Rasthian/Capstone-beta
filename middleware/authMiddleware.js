const admin = require('firebase-admin');


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  admin.auth().verifyIdToken(token)
    .then(() => next())
    .catch((error) => {
      console.error('Error verifying token:', error);
      res.sendStatus(403);
    });
};


module.exports = { verifyToken };
