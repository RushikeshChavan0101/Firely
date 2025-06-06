const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const HMS_BASE_URL = 'https://api.100ms.live/v2';
const { HMS_ACCESS_KEY, HMS_SECRET } = process.env;

async function createRoom(name) {
  const res = await fetch(`${HMS_BASE_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HMS_ACCESS_KEY}:${HMS_SECRET}`
    },
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

function generateToken({room_id, user_id, role}) {
  const payload = {
    access_key: HMS_ACCESS_KEY,
    room_id,
    user_id,
    role,
    type: 'app',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  return jwt.sign(payload, HMS_SECRET);
}

app.post('/create-room', async (req, res) => {
  try {
    const { name } = req.body;
    const room = await createRoom(name);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/token', (req, res) => {
  const { room_id, user_id, role } = req.body;
  try {
    const token = generateToken({ room_id, user_id, role });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
