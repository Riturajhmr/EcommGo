const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_LOVE || 'your-secret-key-here';

const tokenGenerator = (email, firstname, lastname, uid) => {
  const claims = {
    Email: email,
    First_Name: firstname,
    Last_Name: lastname,
    Uid: uid,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const refreshClaims = {
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  const token = jwt.sign(claims, SECRET_KEY);
  const refreshToken = jwt.sign(refreshClaims, SECRET_KEY);

  return { token, refreshToken };
};

const validateToken = (signedToken) => {
  try {
    const decoded = jwt.verify(signedToken, SECRET_KEY);
    
    if (decoded.exp < Date.now() / 1000) {
      return { error: 'token is expired' };
    }

    return {
      email: decoded.Email || decoded.email,
      first_name: decoded.First_Name || decoded.first_name,
      last_name: decoded.Last_Name || decoded.last_name,
      uid: decoded.Uid || decoded.uid
    };
  } catch (error) {
    return { error: error.message };
  }
};

const updateAllTokens = async (signedToken, signedRefreshToken, userId) => {
  try {
    await User.updateOne(
      { user_id: userId },
      {
        $set: {
          token: signedToken,
          refresh_token: signedRefreshToken,
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    console.error('Error updating tokens:', error);
    throw error;
  }
};

module.exports = {
  tokenGenerator,
  validateToken,
  updateAllTokens
};

