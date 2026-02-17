import auth from '../config/betterAuth.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session || !session.user) {
      return res.status(401).json({
        message: 'Access denied. No valid session.',
        code: 'NO_SESSION'
      });
    }

    // Attach user and userId to request object
    req.user = session.user;
    req.userId = session.user.id;
    req.session = session.session;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export default authMiddleware;