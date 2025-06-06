import './App.css';
import React, { useEffect, useState } from 'react';
import { HMSRoomProvider, useHMSActions, useHMSStore, selectPeers } from '@100mslive/react-sdk';

function Conference() {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const [joined, setJoined] = useState(false);

  const joinRoom = async () => {
    const res = await fetch('http://localhost:3001/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: 'YOUR_ROOM_ID',
        user_id: 'user-' + Math.floor(Math.random() * 1000),
        role: 'host'
      })
    });
    const data = await res.json();
    await hmsActions.join({ userName: 'React User', authToken: data.token });
    setJoined(true);
  };

  useEffect(() => {
    // Auto join for demo purposes
    if (!joined) {
      joinRoom();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      {!joined && <p>Joining...</p>}
      {joined && peers.map(peer => (<div key={peer.id}>{peer.name}</div>))}
    </div>
  );
}

export default function App() {
  return (
    <HMSRoomProvider>
      <Conference />
    </HMSRoomProvider>
  );
}
