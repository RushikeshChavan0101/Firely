import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { CLIENT_ID, CLIENT_SECRET, APP_ACCESS_KEY, APP_SECRET } = process.env;

const app = express();
app.use(express.json());

app.post('/api/create-room', async (req, res) => {
  const { role = 'audience', username = 'anonymous' } = req.body;
  try {
    const roomResponse = await axios.post(
      'https://api.100ms.live/v2/rooms',
      { name: `room-${Date.now()}` },
      { headers: { 'X-CLIENT-ID': CLIENT_ID, 'X-CLIENT-SECRET': CLIENT_SECRET } }
    );
    const roomId = roomResponse.data.id;
    const payload = {
      room_id: roomId,
      user_id: username,
      role,
    };
    const token = jwt.sign(payload, APP_SECRET, {
      expiresIn: '1h',
      issuer: APP_ACCESS_KEY,
    });
    res.json({ roomId, token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
