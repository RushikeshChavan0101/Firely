import React, { useState, useEffect } from 'react';
import {
  useHMSStore,
  selectPeers,
  selectCameraStreamByPeerID,
  useVideo,
  useAVToggle,
  useScreenShare,
} from '@100mslive/react-sdk';

function RoomPage({ role, token }) {
  const peers = useHMSStore(selectPeers);
  const [speakerId, setSpeakerId] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [speakingOrder, setSpeakingOrder] = useState({
    currentSpeaker: null,
    queue: [],
    isSpeaking: false
  });

  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const {
    amIScreenSharing,
    screenShareVideoTrackId,
    toggleScreenShare,
  } = useScreenShare();

  // Fetch speaking order status periodically
  useEffect(() => {
    const fetchSpeakingOrder = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/speaking-order');
        const data = await response.json();
        setSpeakingOrder(data);
      } catch (err) {
        console.error('Failed to fetch speaking order:', err);
      }
    };

    fetchSpeakingOrder();
    const interval = setInterval(fetchSpeakingOrder, 2000);
    return () => clearInterval(interval);
  }, []);

  const manageSpeakingOrder = async (action, speakerId = null) => {
    try {
      const response = await fetch('http://localhost:3001/api/speaking-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, speakerId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed');
      }
      setSpeakingOrder(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitScore = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ speakerId, score: Number(score) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed');
      }
      setMessage('Score submitted');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const speak = () => {
    setMessage('Speaking...');
  };

  const PeerTile = ({ peer }) => {
    const videoTrack = useHMSStore(selectCameraStreamByPeerID(peer.id));
    const { videoRef } = useVideo({ trackId: videoTrack?.id });
    
    const isCurrentSpeaker = speakingOrder.currentSpeaker === peer.id;
    const isNextSpeaker = speakingOrder.queue[0] === peer.id;
    
    const getSpeakerStatus = () => {
      if (isCurrentSpeaker) return '🎤 Speaking';
      if (isNextSpeaker) return '⏳ Next';
      if (speakingOrder.queue.includes(peer.id)) return '📋 In Queue';
      return '';
    };

    return (
      <div style={{ 
        display: 'inline-block', 
        margin: '0 10px',
        border: isCurrentSpeaker ? '3px solid #4CAF50' : 
                isNextSpeaker ? '3px solid #FFC107' : '1px solid #ccc',
        padding: '5px',
        borderRadius: '8px'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={peer.isLocal}
          style={{ width: '200px', height: '150px', background: 'black' }}
        />
        <div>
          {peer.name} {peer.isLocal ? '(You)' : ''}
          <div style={{ 
            color: isCurrentSpeaker ? '#4CAF50' : 
                   isNextSpeaker ? '#FFC107' : '#666'
          }}>
            {getSpeakerStatus()}
          </div>
        </div>
      </div>
    );
  };

  const Controls = () => (
    <div style={{ marginTop: '10px' }}>
      {toggleAudio && (
        <button onClick={toggleAudio}>
          {isLocalAudioEnabled ? 'Mute' : 'Unmute'}
        </button>
      )}
      {toggleVideo && (
        <button onClick={toggleVideo}>
          {isLocalVideoEnabled ? 'Hide Camera' : 'Show Camera'}
        </button>
      )}
      {toggleScreenShare && (
        <button onClick={() => toggleScreenShare()}>
          {amIScreenSharing ? 'Stop Share' : 'Share Screen'}
        </button>
      )}
    </div>
  );

  const ScreenShareView = () => {
    const { videoRef } = useVideo({ trackId: screenShareVideoTrackId });
    if (!screenShareVideoTrackId) return null;
    return (
      <div style={{ marginTop: '10px' }}>
        <h3>Screen Share</h3>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '400px', height: '300px', background: 'black' }}
        />
      </div>
    );
  };

  const ModeratorControls = () => {
    // Debug log: print all peers and their roles
    console.log('ModeratorControls peers:', peers);
    return (
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Speaking Order Management</h3>
        <div style={{ marginBottom: '10px' }}>
          <select 
            value={speakerId} 
            onChange={e => setSpeakerId(e.target.value)}
            style={{ marginRight: '10px' }}
          >
            <option value="">Select Participant</option>
            {peers
              .filter(peer => peer.role !== 'guest' && peer.role !== 'audience')
              .map(peer => (
                <option key={peer.id} value={peer.id}>
                  {peer.name} (role: {peer.role})
                </option>
              ))}
          </select>
          <button 
            onClick={() => manageSpeakingOrder('add', speakerId)}
            disabled={!speakerId}
          >
            Add to Queue
          </button>
          <button 
            onClick={() => manageSpeakingOrder('remove', speakerId)}
            disabled={!speakerId}
          >
            Remove from Queue
          </button>
        </div>
        <div>
          <button 
            onClick={() => manageSpeakingOrder('next')}
            disabled={speakingOrder.queue.length === 0 || speakingOrder.isSpeaking}
          >
            Next Speaker
          </button>
          <button 
            onClick={() => manageSpeakingOrder('end')}
            disabled={!speakingOrder.isSpeaking}
          >
            End Current Speech
          </button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <h4>Speaking Queue:</h4>
          <ul>
            {speakingOrder.queue.map((id, index) => {
              const peer = peers.find(p => p.id === id);
              return peer ? (
                <li key={id}>
                  {peer.name} {index === 0 ? '(Next)' : ''}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Debate Room</h2>
      <div>
        {peers.map(peer => (
          <PeerTile key={peer.id} peer={peer} />
        ))}
      </div>
      <Controls />
      <ScreenShareView />
      {role === 'moderator' && <ModeratorControls />}
      {role === 'speaker' && (
        <button onClick={speak}>Speak</button>
      )}
      {role === 'judge' && (
        <div>
          <input
            placeholder="Speaker ID"
            value={speakerId}
            onChange={e => setSpeakerId(e.target.value)}
          />
          <input
            type="number"
            value={score}
            onChange={e => setScore(e.target.value)}
          />
          <button onClick={submitScore}>Submit Score</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default RoomPage;
