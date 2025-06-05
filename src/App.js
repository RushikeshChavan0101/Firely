import './App.css';
import { HMSPrebuilt } from '@100mslive/roomkit-react';
function App() {
  return (
    <div style={{ height: "100vh" }}>
      <HMSPrebuilt roomCode="aue-gnov-bkt" />
    </div>
  );
}

export default App;
