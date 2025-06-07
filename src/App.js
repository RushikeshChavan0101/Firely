import './App.css';
import axios from 'axios';
import { useState } from 'react';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectIsConnected,
  selectLocalPeer,
} from '@100mslive/hms-video-react';

function RoleControls() {
  const localPeer = useHMSStore(selectLocalPeer);
  const hmsActions = useHMSActions();
  if (!localPeer) return null;
  const { roleName } = localPeer;

  return (
    <div>
      <p>You are a {roleName}</p>
      {roleName === 'judge' && <button>Score</button>}
      {roleName === 'speaker' && (
        <button onClick={() => hmsActions.setLocalAudioEnabled(true)}>
          Speak
        </button>
      )}
      {roleName === 'moderator' && <p>Moderator panel</p>}
    </div>
  );
}

function JoinRoom() {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnected);
  const [role, setRole] = useState('audience');

  const join = async () => {
    const { data } = await axios.post('/api/create-room', { role });
    await hmsActions.join({
      authToken: data.token,
      userName: 'guest',
      settings: { isAudioMuted: role !== 'speaker' },
    });
  };

  if (isConnected) {
    return <RoleControls />;
  }

  return (
    <div className="join-panel">
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="judge">Judge</option>
        <option value="speaker">Speaker</option>
        <option value="moderator">Moderator</option>
        <option value="audience">Audience</option>
      </select>
      <button onClick={join}>Join Room</button>
    </div>
  );
}

export default function App() {
  return (
    <HMSRoomProvider>
      <JoinRoom />
    </HMSRoomProvider>
  );
}
