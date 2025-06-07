const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const HMS_BASE = 'https://api.100ms.live/v2';
const { HMS_TEMPLATE_ID, HMS_MANAGEMENT_TOKEN, HMS_ACCESS_KEY, HMS_APP_SECRET, HMS_ROLE } = process.env;

async function findRoom(name) {
  const res = await fetch(`${HMS_BASE}/rooms?limit=1&name=${name}`, {
    headers: { Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

async function createRoom(name) {
  const res = await fetch(`${HMS_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}`
    },
    body: JSON.stringify({ name, template_id: HMS_TEMPLATE_ID })
  });
  if (!res.ok) throw new Error('failed to create room');
  return await res.json();
}

app.post('/api/join', async (req, res) => {
  const { roomName, userName } = req.body;
  if (!roomName || !userName) {
    return res.status(400).json({ error: 'roomName and userName required' });
  }
  try {
    let room = await findRoom(roomName);
    if (!room) {
      room = await createRoom(roomName);
    }
    const payload = {
      access_key: HMS_ACCESS_KEY,
      room_id: room.id,
      user_id: userName,
      role: HMS_ROLE || 'host',
      type: 'app',
      version: 2
    };
    const token = jwt.sign(payload, HMS_APP_SECRET, { expiresIn: '1h' });
    res.json({ token, roomId: room.id });
  } catch (e) {
    res.status(500).json({ error: 'unable to generate token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
