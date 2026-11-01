const { verifyToken, COOKIE_NAME } = require('../utils/jwt');

function requireAuth(req, res, next) {
  // Check HTTPOnly cookie first, then fallback to Authorization header
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required to perform this action.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session expired or invalid token. Please log in again.',
    });
  }

  // Attach decoded user to request
  req.user = decoded;
  next();
}

// Optional Auth (for routes where user can be logged in or guest)
function optionalAuth(req, res, next) {
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};

