import './App.css';
import { useState } from 'react';
import { HMSPrebuilt } from '@100mslive/roomkit-react';

const ROLES = ['Judge', 'Speaker', 'Moderator', 'Audience'];

function RoleSelection({ onSelect }) {
  return (
    <div className="role-selection">
      <h2>Select your role</h2>
      <select data-testid="role-select" defaultValue="" onChange={(e) => onSelect(e.target.value)}>
        <option value="" disabled>Choose role</option>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

function ScoreInput({ onAdd }) {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const submit = () => {
    if (name && score) {
      onAdd(name, score);
      setName('');
      setScore('');
    }
  };
  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Speaker name" />
      <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score" type="number" />
      <button onClick={submit}>Add Score</button>
    </div>
  );
}

function Room({ role }) {
  const [speaking, setSpeaking] = useState(false);
  const [scores, setScores] = useState({});
  const addScore = (name, score) => setScores({ ...scores, [name]: score });
  return (
    <div style={{ height: '100vh' }}>
      <HMSPrebuilt roomCode="aue-gnov-bkt" />
      {role === 'Speaker' && (
        <button onClick={() => setSpeaking(!speaking)} data-testid="speak-btn">
          {speaking ? 'Stop Speaking' : 'Speak'}
        </button>
      )}
      {role === 'Judge' && (
        <div className="scoreboard">
          <h3>Scoreboard</h3>
          <ScoreInput onAdd={addScore} />
          <ul>
            {Object.entries(scores).map(([name, score]) => (
              <li key={name}>{name}: {score}</li>
            ))}
          </ul>
        </div>
      )}
      {role === 'Moderator' && <p className="moderator-panel">Moderator controls enabled</p>}
    </div>
  );
}

function App() {
  const [role, setRole] = useState('');
  if (!role) {
    return <RoleSelection onSelect={setRole} />;
  }
  return <Room role={role} />;
}

export default App;
