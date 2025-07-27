const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Sign up route
router.post('/signup', async (req, res) => {
  const { emailOrMobile, password, confirmPassword } = req.body;

  if (!emailOrMobile || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password confirmation if provided
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ emailOrMobile });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({
      emailOrMobile,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { emailOrMobile, password } = req.body;

  if (!emailOrMobile || !password) {
    return res.status(400).json({ error: 'Email or Mobile and Password are required' });
  }

  try {
    let user = await User.findOne({ emailOrMobile });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
