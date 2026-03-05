// Import dependencies
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Mock database (replace with real DB later)
const users = [];

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.json({ message: 'User registered successfully!' });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(404).json({ message: 'User not found' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

  // Generate JWT token
  const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

// Protected route
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ message: `Welcome ${user.username}!` });
  });
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
