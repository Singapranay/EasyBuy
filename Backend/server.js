require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Order = require('./models/order');
const Contact = require('./models/contact');
const authRouter = require('./routes/auth');
const connectDB = require('./config/db');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Get all users (for admin/debug)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all orders (for admin/debug)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('userId');
    console.log('All orders in database:', orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Test endpoint to check if orders are being saved
app.get('/api/test/orders', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ 
      totalOrders: orderCount, 
      recentOrders: recentOrders 
    });
  } catch (error) {
    console.error('Test orders error:', error);
    res.status(500).json({ error: 'Failed to test orders' });
  }
});

// Routes
app.use('/api/auth', authRouter);

// Fetch user details
app.get("/api/user/:emailOrMobile", async (req, res) => {
  const { emailOrMobile } = req.params;
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Update user details
app.put("/api/user/:emailOrMobile", async (req, res) => {
  const { emailOrMobile } = req.params;
  const { name, mobile, profileImage, address } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { emailOrMobile },
      { name, mobile, profileImage, address },
      { new: true, upsert: false }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Failed to update user details" });
  }
});

// Add product to cart
app.post("/api/cart/:emailOrMobile", async (req, res) => {
  const { emailOrMobile } = req.params;
  const { name, price, imageUrl } = req.body;
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.cart.push({ name, price, imageUrl });
    await user.save();
    res.status(201).json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Failed to add product to cart" });
  }
});

// Get cart items
app.get("/api/cart/:emailOrMobile", async (req, res) => {
  const { emailOrMobile } = req.params;
  try {
    const user = await User.findOne({ emailOrMobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Contact form route
app.post("/api/contact", async (req, res) => {
  const { fullName, email, subject, message } = req.body;
  
  // Validate required fields
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  try {
    const newContact = new Contact({ fullName, email, subject, message });
    await newContact.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new order for a user
app.post('/api/orders', async (req, res) => {
  const { userId, items, total, address } = req.body;
  
  if (!userId || !items || !Array.isArray(items) || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }
  
  // Check if user exists
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const order = new Order({ userId, items, total, address });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// TEST ENDPOINT: Insert sample contact and order
app.post('/api/test/insert-sample', async (req, res) => {
  try {
    // Insert sample contact
    const contact = new Contact({
      fullName: 'Test User',
      email: 'testuser@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.'
    });
    await contact.save();

    // Insert sample user (if not exists)
    let user = await User.findOne({ emailOrMobile: 'testuser@example.com' });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('testpassword', salt);
      user = new User({ emailOrMobile: 'testuser@example.com', password: hashedPassword });
      await user.save();
    }

    // Insert sample order
    const order = new Order({
      userId: user._id,
      items: [
        { name: 'Sample Item', price: 99, imageUrl: 'https://example.com/item.jpg', quantity: 1 }
      ],
      total: 99
    });
    await order.save();

    res.status(201).json({ message: 'Sample contact and order inserted', contact, order });
  } catch (error) {
    console.error('Test insert error:', error);
    res.status(500).json({ error: 'Failed to insert sample data' });
  }
});

// Get all orders for a user
app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
