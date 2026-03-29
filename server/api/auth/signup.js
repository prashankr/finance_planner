const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// User schema (with first and last name)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  base_currency_code: { type: String, default: 'INR' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      passwordHash,
      base_currency_code: 'INR',
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

module.exports = router;
