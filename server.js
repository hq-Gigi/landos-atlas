const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies for API endpoints
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to handle contact form submissions
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  console.log('Contact form submission received:', { name, email, message });
  // Respond with success. In production, you might send an email or store the submission.
  res.status(200).json({ success: true });
});

// Fallback: serve index.html for any unmatched GET routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LandOS Atlas server running on port ${PORT}`);
});
