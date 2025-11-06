const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_LOVE || 'your-secret-key-here';

const authenticate = (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No Authorization Header Provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'token is expired' });
    }

    req.user = {
      email: decoded.Email || decoded.email,
      first_name: decoded.First_Name || decoded.first_name,
      last_name: decoded.Last_Name || decoded.last_name,
      uid: decoded.Uid || decoded.uid
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'The Token is invalid' });
  }
};

module.exports = authenticate;

