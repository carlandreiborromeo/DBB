const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000; // or any port you prefer

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
  .catch((err) => console.error('Error connecting to database:', err));

// Route to save game data
app.post('/save-game', async (req, res) => {
  const { name, turns, time } = req.body;

  try {
    await sql.connect(config);
    const result = await sql.query`
      INSERT INTO PlayerScores (PlayerName, Turns, TimeElapsed)
      VALUES (${name}, ${turns}, ${time})
    `;

    res.status(200).json({ msg: 'Game data saved' });
  } catch (err) {
    console.error('Error saving game data:', err);
    res.status(500).json({ msg: 'Failed to save game data' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
