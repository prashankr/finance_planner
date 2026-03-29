const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// Same User schema as signup.js
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  base_currency_code: { type: String, default: 'USD' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    // Compare password against passwordHash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    // Return user info on success
    return res.status(200).json({
      ok: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        base_currency_code: user.base_currency_code,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
});

module.exports = router;