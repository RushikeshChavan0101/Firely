import './App.css';
import { HMSPrebuilt } from '@100mslive/roomkit-react';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');

  const handleJoin = async () => {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, userName }),
    });
    const data = await res.json();
    setToken(data.token);
  };

  if (token) {
    return (
      <div style={{ height: '100vh' }}>
        <HMSPrebuilt authToken={token} />
      </div>
    );
  }

  return (
    <div className="join-container">
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
      />
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Your Name"
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}

export default App;
