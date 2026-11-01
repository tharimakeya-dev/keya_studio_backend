const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getUsersCollection } = require('../config/db');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');

// Validation helper
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  return null;
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, photoURL, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const usersCol = getUsersCollection();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await usersCol.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      photoURL: photoURL && photoURL.trim() ? photoURL.trim() : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      password: hashedPassword,
      role: 'creator',
      createdAt: new Date(),
    };

    const result = await usersCol.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. You can now log in.',
      userId: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const usersCol = getUsersCollection();
    const normalizedEmail = email.trim().toLowerCase();

    const user = await usersCol.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const tokenPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role || 'creator',
    };

    const token = generateToken(tokenPayload);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Welcome back! Logged in successfully.',
      user: tokenPayload,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/social-login (Google / GitHub OAuth handling)
async function socialLogin(req, res, next) {
  try {
    const { name, email, photoURL, provider } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from social provider.',
      });
    }

    const usersCol = getUsersCollection();
    const normalizedEmail = email.trim().toLowerCase();

    let user = await usersCol.findOne({ email: normalizedEmail });

    if (!user) {
      const newUser = {
        name: name || email.split('@')[0],
        email: normalizedEmail,
        photoURL: photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        provider: provider || 'google',
        role: 'creator',
        createdAt: new Date(),
      };
      const result = await usersCol.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else if (photoURL && (!user.photoURL || user.photoURL.includes('default'))) {
      await usersCol.updateOne({ _id: user._id }, { $set: { photoURL } });
      user.photoURL = photoURL;
    }

    const tokenPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role || 'creator',
    };

    const token = generateToken(tokenPayload);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: `Signed in successfully with ${provider || 'social login'}.`,
      user: tokenPayload,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me (Get current session from HTTPOnly cookie)
async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        user: null,
      });
    }

    const usersCol = getUsersCollection();
    let user = null;
    try {
      user = await usersCol.findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0 } }
      );
    } catch {
      user = await usersCol.findOne(
        { email: req.user.email },
        { projection: { password: 0 } }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        user: null,
        message: 'User profile not found.',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role || 'creator',
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  clearTokenCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

module.exports = {
  register,
  login,
  socialLogin,
  getMe,
  logout,
};

