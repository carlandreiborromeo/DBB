const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port assignment for Azure

app.use(bodyParser.json());
app.use(cors());

// Database configuration (use your Azure SQL connection string here)
const config = {
  user: 'carl-borromeo',
  password: '2004Andrei',
  server: 'db-memory-carl2004.database.windows.net',
  database: 'carl-memoryDB',
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Ignore SSL certificate validation for simplicity
  },
};

// Test database connection
sql.connect(config)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Error connecting to database:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  });

// Health check endpoint
app.get('/', (req, res) => {
  res.send('App is running and healthy.');
});

// Route to save game data
app.post('/save-game', async (req, res) => {
  const { name, turns, time } = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO PlayerScores (PlayerName, Turns, TimeElapsed)
      VALUES (${name}, ${turns}, ${time})
    `;

    res.status(201).json({ msg: 'Game data saved successfully' });
  } catch (err) {
    console.error('Error saving game data:', err.message);
    res.status(500).json({ msg: 'Failed to save game data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
